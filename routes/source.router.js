const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const { config } = require('../config/config');

const SourceService = require('../services/source.service');
const service = new SourceService();
const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();
const DocumentService = require('../services/document.service');
const documentServ = new DocumentService();
const PipelineService = require('../services/pipeline.service');
const pipelineServ = new PipelineService();

const validatorHandler = require('../middlewares/validator.handler');
const uploadhandler = require('../middlewares/upload.handler');
const { getInstanceSchema} = require('../schemas/instance.schema');
const { 
  getSourceSchema, 
  updateSourceSchema, 
  createSourceSchema, 
  getSourceIdSchema, 
  updateStatusSourceSchema,
  createSourceFileSchema } = require('../schemas/source.schema');

const router = express.Router({ mergeParams: true });

router.get('/', 
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const source = await service.findByInstance(instanceId);
      res.json(source);
    } catch (error) {
      next(error);
    }
});

router.get('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getSourceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;
      
      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const instance = await service.findOne(id);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/file',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  uploadhandler,
  validatorHandler(createSourceFileSchema, 'body'),
  async (req, res, next) => {
    try {
        const { instanceId  } = req.params;
        const userId = req.user.sub;
        const files = req.files;
        if(req.user.role !== 'SUPER') {
          const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
          if(relationships.length === 0) throw boom.unauthorized();
        }

        const body = req.body;
        body.instanceId = instanceId;
        body.sourcetype = "FILE";
        const source = await service.create(body);

        files.forEach((file) => {
          const filePath = `uploads/${instanceId}/${file.filename}`;
          const new_name = file.filename;
          const old_name = new_name.substr(14)

          fs.rename(file.path, filePath, async (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to store the file' });
            }

            const documentInfo = {
              url: filePath,
              newname: new_name,
              oldname: old_name,
              state: 0,
              sourceId: source.id,
            };
            
            await documentServ.create(documentInfo);

            const callback = `${config.apiUrl}/api/v1/instances/0/sources/status/${source.id}`;
            console.log('Callback Extractor URL:', callback);

            const form = new FormData();
            form.append('id', source.id);
            form.append('file', fs.createReadStream(filePath)); // El primer argumento es el nombre del campo en la API de destino
            form.append('include_page_breaks', 'true');
            form.append('callback_url', callback);

            const urlExtractor = `${config.moduleExtractor}/process`;;

            try {
              // Hacer la solicitud POST con Axios
              const response = await axios.post(urlExtractor, form, {
                headers: {
                  ...form.getHeaders() // Es necesario incluir los encabezados de 'multipart/form-data'
                }
              });
          
              // Manejar la respuesta de la API
              console.log('Response data:', response.data);

            } catch (error) {
              console.error('Error al enviar el archivo al Extractor:', error.response ? error.response.data : error.message);
            }
          });
        });
    
        res.status(201).json(source);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/web',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createSourceSchema, 'body'),
  async (req, res, next) => {
    try {
        const { instanceId  } = req.params;
        const userId = req.user.sub;
        if(req.user.role !== 'SUPER') {
          const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
          if(relationships.length === 0) throw boom.unauthorized();
        }

        const body = req.body;
        body.instanceId = instanceId;
        const source = await service.create(body);

        const callback = `${config.apiUrl}/api/v1/instances/0/sources/status/${source.id}`;
        console.log('Callback Extractor URL:', callback);

        const data = {
          id: source.id,
          url: source.reference,
          callback_url: callback,
          limit: 500,
          mode: source.web_connector_type,
          extract_documents: false,
          extract_multimedia: false
        }

        const urlScraper = `${config.moduleScraping}/process`;

        try {
          const response = await axios.post(urlScraper, data );
          console.log('Response data:', response.data);

        } catch (error) {
          console.error('Error al enviar el archivo al Scraping:', error.response ? error.response.data : error.message);
        }

        res.status(201).json(source);
    } catch (error) {
      next(error);
    }
  }
);

// STATUS CODE 4 INDEX
// STATUS CODE 3 INDEX INPROGRESS
// STATUS CODE 2 INDEX SUCCESS
// STATUS CODE 1 EXTRACTION SUCCESS
// STATUS CODE 0 INPROGRESS
// STATUS CODE -1 EXTRACTION FAILED
// STATUS CODE -2 EXTRACTION FAILED
router.post('/status/:id',
  validatorHandler(getSourceSchema, 'params'),
  validatorHandler(updateStatusSourceSchema, 'body'),
  async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, processor, pages, message } = req.body;
        console.log("Status: ",req.body)
        let indexstatus = 0

        if (processor === 'text-extractor' || processor === "web-scraper") {
          if(status === "SUCCESS") {
            indexstatus = 1
            const response  = await pipelineServ.index(id, processor);
       
            if (response.success === false) indexstatus = -2;
            else indexstatus = 2; // TODO INDEX
          }
          else if(status === "FAILED") indexstatus = -1

          await service.update({id: id, indexstatus: indexstatus, pages: pages });
        }

        if(processor === 'eco-pipeline-index') {
          if(status === "SUCCESS") indexstatus = 4 // DONE
          else if(status === "INPROGRESS") indexstatus = 3 // INPROGRESS
          else if(status === "FAILED") indexstatus = -3

          await service.update({id: id, indexstatus: indexstatus });
        }

        res.status(201).json({ message: 'Callback successful' });
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(updateSourceSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const body = req.body;
      body.instanceId = instanceId;

      const source = await service.update( body);
      res.json(source);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getSourceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;

      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      console.log("Eliminating source", id)
      await service.delete(id);

      const indexUrl = `${config.modulePipeline}/index/${id}`;
      try {
        const response = await axios.delete(indexUrl);
        console.log('Eliminado de INDEX', response.data);
      } catch (error) {
        console.error('Error al eliminar de INDEX:', error.response ? error.response.data : error.message);
      }

      res.status(201).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

