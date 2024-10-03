const express = require('express');
const passport = require('passport');
const fs = require('fs');
const boom = require('@hapi/boom');

const DocumentService = require('../services/document.service');
const InstanceService = require('../services/instance.service');
const BalanceService = require('../services/balance.service');

const validatorHandler = require('../middlewares/validator.handler');
const uploadhandler = require('../middlewares/upload.handler');
const { getInstanceYearSchema } = require('../schemas/instance.schema');
const { getDocumentSchema, createDocumentSchema, updateDocumentSchema } = require('../schemas/document.schema');

const router = express.Router({ mergeParams: true });
const service = new DocumentService();
const instance = new InstanceService();
const balance = new BalanceService();

router.get('/', 
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceYearSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, year } = req.params;
      const userId = req.user.sub;
      const relationships = await instance.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      const document = await service.findByInstanceYear(instanceId, year);
      res.json(document);
    } catch (error) {
      next(error);
    }
});

router.get('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getDocumentSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;
      const relationships = await instance.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      const document = await service.getOne(id, instanceId);

      const file = `${__dirname}/../${document.url}`; // Path to the file
      const filename = document.oldname;

      fs.access(file, fs.constants.F_OK, (err) => {
        if (err) {
          return res.status(404).send('File not found');
        }
    
        // Set the appropriate headers for the response
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/octet-stream');
    
        // Stream the file to the response
        const fileStream = fs.createReadStream(file);
        fileStream.pipe(res);
      });
      // res.download(file);

      // Set the appropriate headers for the response
      // res.setHeader('Content-Disposition', `attachment; filename=${document.oldname}`);
      // //res.setHeader('Content-Type', 'text/plain');
    
      // // Stream the file to the response
      // const fileStream = fs.createReadStream(file);
      // fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/:typeId',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(createDocumentSchema, 'params'),
  uploadhandler,
  async (req, res, next) => {
    try {
        const { instanceId, typeId } = req.params;
        const userId = req.user.sub;
        const files = req.files;
        const relationships = await instance.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();

        files.forEach((file) => {
          const filePath = `uploads/${instanceId}/${file.filename}`;
          const new_name = file.filename;
          const old_name = new_name.substr(14)

          fs.rename(file.path, filePath, async (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to store the file' });
            }

            const imageInfo = {
              url: filePath,
              newname: new_name,
              oldname: old_name,
              state: 0,
              typeId: typeId,
              instanceId: instanceId,
            };
            
            const newDoc = await service.create(imageInfo);

            if(typeId === "3" || typeId === "4") {
              const balances = await balance.findByInstanceType(instanceId, typeId)

              if(balances.length > 0) {
                const balance_doc = {
                  id: balances[0].id,
                  oldname: old_name,
                  typeId: typeId,
                  instanceId: instanceId,
                  documentId: newDoc.id,
                }
                
                balance.update(balance_doc)
              }
              else{
                const balance_doc = {
                  typeId: typeId,
                  oldname: old_name,
                  instanceId: instanceId,
                  documentId: newDoc.id,
                }

                balance.create(balance_doc)
              }
            }
            
          });
        });
      
        // Send an appropriate response to the client
        res.status(201).json({ message: 'File upload successful' });
      
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceYearSchema, 'params'),
  validatorHandler(updateDocumentSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      const relationships = await instance.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      const body = req.body;
      body.instanceId = instanceId;
      const client = await service.update( body);
      res.json(client);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;