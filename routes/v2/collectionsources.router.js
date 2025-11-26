const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const CollectionSourceService = require('../../services/collectionsource.service');
const service = new CollectionSourceService();
const InstanceService = require('../../services/instance.service');
const instanceServ = new InstanceService();

const CollectionService = require('../../services/collection.service');
const collectionServ = new CollectionService();

const SourceService = require('../../services/source.service');
const sourceServ = new SourceService();

const PipelineService = require('../../services/pipeline.service');
const pipelineServ = new PipelineService();

const validatorHandler = require('../../middlewares/validator.handler');
const { getInstanceSchema } = require('../../schemas/instance.schema');
const {
  getCollectionSourceSchema,
  createCollectionSourceSchema,
} = require('../../schemas/collectionsources.schema');

const { OpenAIManager } = require('../../libs/openai');
const openaiManager = new OpenAIManager();

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createCollectionSourceSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      const body = req.body;
      console.log('Body: ', body);

      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      const collectionInfo = await collectionServ.findOne(body.collectionId);
      if (!collectionInfo) throw boom.notFound('Collection not found');

      const sourceInfo = await sourceServ.findOne(body.sourceId);
      if (!sourceInfo) throw boom.notFound('Source not found');

      const vectorStoreFile = await openaiManager.createVectorStoreFile(
        collectionInfo.openai_id,
        sourceInfo.openai_id,
        false
      );
      if (!vectorStoreFile) throw boom.notFound('Vector store file not found');

      body.openai_id = vectorStoreFile.id;
      const collection = await service.create(body);

      const collectionSourcePipiline = {
        collection_id: body.collectionId,
        document_ids: [body.sourceId],
      };

      await pipelineServ.addCollectionSource(collectionSourcePipiline);

      res.status(201).json(collection);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getCollectionSourceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;
      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      const deleteCS = await service.delete(id);

      const collectionSourcePipiline = {
        collection_id: deleteCS.collectionId,
        document_ids: [deleteCS.sourceId],
      };

      const rta = await pipelineServ.deleteCollectionSource(
        collectionSourcePipiline
      );
      console.log('res pipeline delete CollectionSource', rta);

      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
