const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const SessionService = require('../services/session.service');
const service = new SessionService();
const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();

const QueryService = require('../services/query.service');
const queryServ = new QueryService();

const validatorHandler = require('../middlewares/validator.handler');
const { getInstanceSchema} = require('../schemas/instance.schema');
const { getSessionSchema, updateSessionSchema, createSessionSchema } = require('../schemas/session.schema');

const router = express.Router({ mergeParams: true });

router.get('/', 
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      const session = await service.findByUser(userId);
      res.json(session);
    } catch (error) {
      next(error);
    }
});

router.get('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getSessionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;
      
      const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      const instance = await service.findOne(id);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/query',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getSessionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;
      
      const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      const queries = await queryServ.findBySession(id);
      res.json(queries);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createSessionSchema, 'body'),
  async (req, res, next) => {
    try {
        const { instanceId  } = req.params;
        const userId = req.user.sub;
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();

        const body = req.body;
        body.instanceId = instanceId;
        body.userId = userId;
        const session = await service.create(body);
        res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/public',
  validatorHandler(createSessionSchema, 'body'),
  async (req, res, next) => {
    try {
        const userId = 0;
        const body = req.body;
        body.userId = userId;
        const session = await service.create(body);
        res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(updateSessionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      const body = req.body;
      body.instanceId = Number(instanceId);

      const session = await service.update(body);
      res.json(session);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getSessionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;
      const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      await service.delete(id);
      res.status(201).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

