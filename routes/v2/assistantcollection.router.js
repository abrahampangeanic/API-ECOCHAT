const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const AssistantCollectionService = require('../../services/assistantcollection.service');
const assistantCollectionServ = new AssistantCollectionService();
const InstanceService = require('../../services/instance.service');
const instanceServ = new InstanceService();
const CollectionService = require('../../services/collection.service');
const collectionServ = new CollectionService();
const AssistantService = require('../../services/assistant.service');
const assistantServ = new AssistantService();

const validatorHandler = require('../../middlewares/validator.handler');
const { getInstanceSchema } = require('../../schemas/instance.schema');
const {
  createAssistantCollectionSchema,
  getAssistantCollectionSchema,
} = require('../../schemas/assistantcollection.schema');

// OpenAI Manager
const { OpenAIManager } = require('../../libs/openai');
const openaiManager = new OpenAIManager();

const router = express.Router({ mergeParams: true });

// CREATE ASSISTANT COLLECTION
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createAssistantCollectionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      const body = req.body;

      if (req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(
          instanceId,
          userId
        );
        if (relationships.length === 0) throw boom.unauthorized();
      }

      const assistant = await assistantServ.findOne(body.assistantId);
      if (!assistant) throw boom.notFound('Assistant not found');

      const collection = await collectionServ.findOne(body.collectionId);
      if (!collection) throw boom.notFound('Collection not found');

      // // Agregar vector store al asistente en OpenAI
      await openaiManager.addVectorStoreToAssistant(
        assistant.openai_id,
        collection.openai_id
      );

      const assistantCollection = await assistantCollectionServ.create(body);
      res.status(201).json(assistantCollection);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE ASSISTANT COLLECTION
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getAssistantCollectionSchema, 'params'),
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

      await assistantCollectionServ.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
