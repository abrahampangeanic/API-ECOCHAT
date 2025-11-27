const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const { instructions } = require('../../libs/openai-instruction');

const AssistantService = require('../../services/assistant.service');
const service = new AssistantService();
const InstanceService = require('../../services/instance.service');
const instanceServ = new InstanceService();

const validatorHandler = require('../../middlewares/validator.handler');
const { getInstanceSchema } = require('../../schemas/instance.schema');
const {
  getAssistantSchema,
  updateAssistantSchema,
  createAssistantSchema,
} = require('../../schemas/assistant.schema');
const { OpenAIManager } = require('../../libs/openai');
const openaiManager = new OpenAIManager();

const router = express.Router({ mergeParams: true });

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

      const assistant = await service.findByInstance(instanceId);
      res.json(assistant);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/public',
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const assistant = await service.findByInstancePublic(instanceId);
      res.json(assistant);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getAssistantSchema, 'params'),
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

      const instance = await service.findOne(id);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createAssistantSchema, 'body'),
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

      const instance = await instanceServ.findOne(instanceId);
      if (!instance) throw boom.notFound('Instance not found');
      const name = `${instance.name} - ${body.name}`;

      const assistantOpenAI = await openaiManager.createAssistant({
        name,
        instructions: instructions,
        tools: [{ type: 'file_search' }],
      });

      body.instanceId = instanceId;
      body.openai_id = assistantOpenAI.id;
      const assistantObject = await service.create(body);
      res.status(201).json(assistantObject);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(updateAssistantSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      const relationships = await instanceServ.checkInstancesByUser(
        instanceId,
        userId
      );
      const body = req.body;
      body.instanceId = instanceId;

      if (relationships.length === 0) throw boom.unauthorized();

      const assistant = await service.update(body);
      res.json(assistant);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getAssistantSchema, 'params'),
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

      await service.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
