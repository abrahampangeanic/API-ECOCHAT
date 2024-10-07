const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const SourceService = require('../services/source.service');
const service = new SourceService();
const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();
const DocumentService = require('../services/document.service');
const documentServ = new DocumentService();

const validatorHandler = require('../middlewares/validator.handler');
const uploadhandler = require('../middlewares/upload.handler');
const { getInstanceSchema} = require('../schemas/instance.schema');
const { getSourceSchema, updateSourceSchema, createSourceSchema, createSourceFileSchema } = require('../schemas/source.schema');

const router = express.Router({ mergeParams: true });

router.get('/', 
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

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
      
      const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

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
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();

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
            
            const document = await documentServ.create(documentInfo);

            const callback = `http://192.168.100.143:3000/api/v1/documents/callback/${document.id}`;
            console.log('Callback URL:', callback);

            const form = new FormData();
            form.append('id', document.id);
            form.append('file', fs.createReadStream(filePath)); // El primer argumento es el nombre del campo en la API de destino
            form.append('include_page_breaks', 'true');
            form.append('callback_url', callback);

            const urlExtractor = 'https://api-priv.pangeanic.com/module/text-extractor/process';

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
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();

        const body = req.body;
        body.instanceId = instanceId;
        const source = await service.create(body);
        res.status(201).json(source);
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
      const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      const body = req.body;
      body.instanceId = instanceId;

      const source = await service.update(instanceId, body);
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
      const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      await service.delete(id);
      res.status(201).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

