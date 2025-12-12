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

const validatorHandler = require('../../middlewares/validator.handler');
const { getInstanceSchema } = require('../../schemas/instance.schema');
const {
  getCollectionSourceSchema,
  createCollectionSourceSchema,
} = require('../../schemas/collectionsources.schema');

const { OpenAIManager } = require('../../libs/openai');
const openaiManager = new OpenAIManager();

const router = express.Router({ mergeParams: true });

// CREATE COLLECTION SOURCE
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

      if (sourceInfo.sourcetype === 'FILE') {
        console.log(
          'Creating vector store file: ',
          collectionInfo.openai_id,
          sourceInfo.openai_id
        );
        const vectorStoreFile = await openaiManager.createVectorStoreFile(
          collectionInfo.openai_id,
          sourceInfo.openai_id,
          false
        );
        if (!vectorStoreFile)
          throw boom.notFound('Vector store file not found');

        body.openai_id = vectorStoreFile.id;
      }

      const collection = await service.create(body);
      res.status(201).json(collection);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE COLLECTION SOURCE
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

      const collectionSource = await service.findOne(id);
      if (!collectionSource) throw boom.notFound('CollectionSource not found');

      const sourceInfo = await sourceServ.findOne(collectionSource.sourceId);
      if (!sourceInfo) throw boom.notFound('Source not found');
      const collectionInfo = await collectionServ.findOne(
        collectionSource.collectionId
      );
      if (!collectionInfo) throw boom.notFound('Collection not found');

      console.log('CollectionSource: ', collectionSource.dataValues);
      console.log('SourceInfo: ', sourceInfo.dataValues);
      console.log('CollectionInfo: ', collectionInfo.dataValues);

      if (sourceInfo.sourcetype === 'FILE') {
        console.log(
          'Deleting vector store file: ',
          collectionInfo.openai_id,
          sourceInfo.openai_id
        );
        const vectorStoreFile = await openaiManager.deleteVectorStoreFile(
          collectionInfo.openai_id,
          sourceInfo.openai_id
        );
        console.log('VectorStoreFile: ', vectorStoreFile);
        if (!vectorStoreFile)
          throw boom.notFound('Vector store file not deleted');
      }

      await service.delete(id);
      console.log('CollectionSource deleted', id);

      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
