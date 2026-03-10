const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const AssistantService = require('../../services/assistant.service');
const assistantService = new AssistantService();
const InstanceService = require('../../services/instance.service');
const instanceServ = new InstanceService();
const AssistantCollectionService = require('../../services/assistantcollection.service');
const assistantCollectionServ = new AssistantCollectionService();
const PromptService = require('../../services/prompt.service');
const promptService = new PromptService();
const validatorHandler = require('../../middlewares/validator.handler');
const { getInstanceSchema } = require('../../schemas/instance.schema');
const {
  getAssistantSchema,
  updateAssistantSchema,
  createAssistantSchema,
} = require('../../schemas/assistant.schema');
const { getAssistantWithCache } = require('../../cache/assistant.cache');
const AssistantPromptService = require('../../services/assistantprompt.service');
const assistantPromptService = new AssistantPromptService();

// OpenAI Manager
const { OpenAIManager } = require('../../libs/openai');
const openaiManager = new OpenAIManager();
const {
  instructionContext,
  instructionPromptV1,
} = require('../../libs/openai-instruction');

const router = express.Router({ mergeParams: true });

// GET ASSISTANTS
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

      const assistant = await assistantService.findByInstance(instanceId);
      res.json(assistant);
    } catch (error) {
      next(error);
    }
  }
);

// GET PUBLIC ASSISTANT
router.get(
  '/public',
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const assistant = await assistantService.findByInstancePublic(instanceId);
      res.json(assistant);
    } catch (error) {
      next(error);
    }
  }
);

// GET ASSISTANT
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

      const assistant = await getAssistantWithCache(id);
      if (!assistant) throw boom.notFound('Assistant not found');
      res.json(assistant);
    } catch (error) {
      next(error);
    }
  }
);

// CREATE ASSISTANT
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

      // Crear asistente en OpenAI
      const name = `${instance.name} - ${body.name}`;
      const assistantOpenAI = await openaiManager.createAssistant({
        name,
        instructions: instructionContext,
        tools: [{ type: 'file_search' }],
      });
      body.openai_id = assistantOpenAI.id;

      body.instanceId = instanceId;

      // Crear prompt por defecto
      const prompt1 = await promptService.create({
        name: body.name + ' - Context',
        description: 'Prompt of default context',
        prompt: instructionContext,
        lang: 'es',
        type: 'Context',
        skill: 'general',
        shared: 0,
        instanceId: instanceId,
      });

      const prompt2 = await promptService.create({
        name: body.name + ' - Without Context',
        description: 'Prompt of default without context',
        prompt: instructionPromptV1,
        lang: 'es',
        type: 'WithoutContext',
        skill: 'general',
        shared: 0,
        instanceId: instanceId,
      });

      const assistantObject = await assistantService.create(body);

      await assistantPromptService.create({
        assistantId: assistantObject.id,
        promptId: prompt1.id,
      });

      await assistantPromptService.create({
        assistantId: assistantObject.id,
        promptId: prompt2.id,
      });

      res.status(201).json(assistantObject);
    } catch (error) {
      next(error);
    }
  }
);

// UPDATE ASSISTANT
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

      const assistant = await assistantService.update(body);
      res.json(assistant);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE ASSISTANT
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

      await assistantService.delete(id);
      await assistantCollectionServ.deleteByAssistant(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
