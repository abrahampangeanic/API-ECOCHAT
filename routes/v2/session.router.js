const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const SessionService = require('../../services/session.service');
const service = new SessionService();
const InstanceService = require('../../services/instance.service');
const instanceServ = new InstanceService();

const QueryService = require('../../services/query.service');
const queryServ = new QueryService();

const validatorHandler = require('../../middlewares/validator.handler');
const { getInstanceSchema } = require('../../schemas/instance.schema');
const {
  getSessionSchema,
  updateSessionSchema,
  createSessionSchema,
  getSessionByAssitantSchema,
} = require('../../schemas/session.schema');
const { OpenAIManager } = require('../../libs/openai');
const openaiManager = new OpenAIManager();

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      const userId = req.user.sub;
      const session = await service.findByUser(userId);
      res.json(session);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/assistant/:assistantId',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getSessionByAssitantSchema, 'params'),
  async (req, res, next) => {
    try {
      const { assistantId } = req.params;
      const userId = req.user.sub;
      const session = await service.findByUserAssistant(userId, assistantId);
      res.json(session);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getSessionSchema, 'params'),
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

router.get(
  '/:id/query',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getSessionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const queries = await queryServ.findBySession(id);
      res.json(queries);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(createSessionSchema, 'body'),
  async (req, res, next) => {
    try {
      const userId = req.user.sub;
      const body = req.body;

      const threadOpenAI = await openaiManager.createThread();
      if (!threadOpenAI) throw boom.notFound('Thread not found');

      body.userId = userId;
      body.openai_id = threadOpenAI.id;
      const sessionObject = await service.create(body);
      res.status(201).json(sessionObject);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/public',
  validatorHandler(createSessionSchema, 'body'),
  async (req, res, next) => {
    try {
      const userId = 0;
      const body = req.body;
      body.userId = userId;

      const threadOpenAI = await openaiManager.createThread();
      if (!threadOpenAI) throw boom.notFound('Thread not found');

      body.openai_id = threadOpenAI.id;
      const sessionObject = await service.create(body);
      res.status(201).json(sessionObject);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(updateSessionSchema, 'body'),
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

      const session = await service.update(body);
      res.json(session);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  validatorHandler(getSessionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
