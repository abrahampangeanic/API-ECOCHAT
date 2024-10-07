const express = require('express');
const boom = require('@hapi/boom');

// const DocumentService = require('../services/document.service');
// const InstanceService = require('../services/instance.service');
// const service = new DocumentService();
// const instance = new InstanceService();


const checkApiKey = require('../middlewares/auth.handler');

const { getInstanceYearSchema } = require('../schemas/instance.schema');
const { getDocumentSchema, updateStatusDocumentSchema } = require('../schemas/document.schema');

const router = express.Router({ mergeParams: true });


router.post('/',
  checkApiKey,
  // validatorHandler(getDocumentSchema, 'params'),
  // validatorHandler(updateStatusDocumentSchema, 'body'),
  async (req, res, next) => {
    try {
        // const { documentId } = req.params;
        // const { status } = req.body;

        // const document = await service.update({id: documentId, statu: status }); // Extractor ID hardcoded for now
        // console.log(document);
        // // Send an appropriate response to the client
        res.status(200).json({ message: 'hola que tal' });
      
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;