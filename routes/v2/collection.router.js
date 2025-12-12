const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const CollectionService = require('../../services/collection.service');
const collectionService = new CollectionService();
const InstanceService = require('../../services/instance.service');
const instanceServ = new InstanceService();
const CollectionSourceService = require('../../services/collectionsource.service');
const collectionSourceServ = new CollectionSourceService();
const AssistantCollectionService = require('../../services/assistantcollection.service');
const assistantCollectionServ = new AssistantCollectionService();

const validatorHandler = require('../../middlewares/validator.handler');
const { getInstanceSchema } = require('../../schemas/instance.schema');
const {
  getCollectionSchema,
  updateCollectionSchema,
  createCollectionSchema,
} = require('../../schemas/collection.schema');
const { OpenAIManager } = require('../../libs/openai');
const openaiManager = new OpenAIManager();

const router = express.Router({ mergeParams: true });

// GET COLLECTIONS
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;

      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      const collection = await collectionService.findByInstance(instanceId);
      res.json(collection);
    } catch (error) {
      next(error);
    }
  }
);

// GET COLLECTION
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getCollectionSchema, 'params'),
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

      const instance = await collectionService.findOne(id);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

// CREATE COLLECTION
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createCollectionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const body = req.body;
      const userId = req.user.sub;
      console.log('Body: ', body);

      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      const instance = await instanceServ.findOne(instanceId);
      if (!instance) throw boom.notFound('Instance not found');
      const name = `${instance.name} - ${body.name}`;

      const vectorStore = await openaiManager.createVectorStore(name);

      console.log('Vector Store: ', vectorStore);

      body.instanceId = instanceId;
      body.openai_id = vectorStore.id;
      const collection = await collectionService.create(body);
      res.status(201).json(collection);
    } catch (error) {
      next(error);
    }
  }
);

// UPDATE COLLECTION
router.patch(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(updateCollectionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;

      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      const body = req.body;
      body.instanceId = instanceId;

      const collection = await collectionService.update(body);
      res.json(collection);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE COLLECTION
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getCollectionSchema, 'params'),
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
      const collection = await collectionService.findOne(id);
      if (!collection) throw boom.notFound('Collection not found');

      await openaiManager.deleteVectorStore(collection.openai_id);

      await collectionSourceServ.deleteByCollection(id);

      await assistantCollectionServ.deleteByCollection(id);

      await collectionService.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
