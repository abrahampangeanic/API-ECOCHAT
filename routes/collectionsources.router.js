const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const CollectionSourceService = require('../services/collectionsource.service');
const service = new CollectionSourceService();
const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();
const PipelineService = require('../services/pipeline.service');
const pipelineServ = new PipelineService();

const validatorHandler = require('../middlewares/validator.handler');
const { getInstanceSchema} = require('../schemas/instance.schema');
const { getCollectionSourceSchema, createCollectionSourceSchema } = require('../schemas/collectionsources.schema');

const router = express.Router({ mergeParams: true });

router.post('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createCollectionSourceSchema, 'body'),
  async (req, res, next) => {
    try {
        const { instanceId  } = req.params;
        const userId = req.user.sub;

        if(req.user.role !== 'SUPER') {
          const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
          if(relationships.length === 0) throw boom.unauthorized();
        }

        const body = req.body;
        const collection = await service.create(body);

        const collectionSourcePipiline = {
          collection_id: body.collectionId,
          document_ids: [ body.sourceId]
        }

        await pipelineServ.addCollectionSource(collectionSourcePipiline);

        res.status(201).json(collection);
    } catch (error) {
      next(error);
    }
  }
);


router.delete('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getCollectionSourceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;
      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const deleteCS = await service.delete(id);

      const collectionSourcePipiline = {
        collection_id: deleteCS.collectionId,
        document_ids: [ deleteCS.sourceId]
      }

      const rta = await pipelineServ.deleteCollectionSource(collectionSourcePipiline);
      console.log("res pipeline delete CollectionSource", rta)

      res.status(201).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

