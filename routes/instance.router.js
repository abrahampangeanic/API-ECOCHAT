const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const instanceService = require('../services/instance.service');
const { checkRoles } = require('../middlewares/auth.handler');
const validatorHandler = require('../middlewares/validator.handler');
const { createInstanceSchema, getInstanceSchema, updateInstanceSchema,  } = require('../schemas/instance.schema');

const assistantRouter = require('./assistant.router');
const assistantCollectionRouter = require('./assistantcollection.router');
const assistantPromptRouter = require('./assistantprompt.router');
const assistantSkillRouter = require('./assistantskill.router');
const assistantMessageRouter = require('./assistantmessage.router');
const promptRouter = require('./prompt.router');
const collectionRouter = require('./collection.router');
const collectionSourceRouter = require('./collectionsources.router');
const sourceRouter = require('./source.router');
const userRouter = require('./users.router');
const groupRouter = require('./group.router');
const userGroupRouter = require('./usergroup.router');
const permissionsRouter = require('./permission.router');
const statsRouter = require('./stats.router');
const queryRouter = require('./query.router');


const router = express.Router();
const service = new instanceService();

router.use('/:instanceId/users', userRouter);
router.use('/:instanceId/assistants', assistantRouter);
router.use('/:instanceId/assistantscollections', assistantCollectionRouter);
router.use('/:instanceId/assistantsskills', assistantSkillRouter);
router.use('/:instanceId/assistantsprompts', assistantPromptRouter);
router.use('/:instanceId/assistantmessages', assistantMessageRouter);
router.use('/:instanceId/assistants', assistantRouter);
router.use('/:instanceId/prompts', promptRouter);
router.use('/:instanceId/collections', collectionRouter);
router.use('/:instanceId/collectionsources', collectionSourceRouter);
router.use('/:instanceId/sources', sourceRouter);
router.use('/:instanceId/groups', groupRouter);
router.use('/:instanceId/usergroups', userGroupRouter);
router.use('/:instanceId/permissions', permissionsRouter);
router.use('/:instanceId/stats', statsRouter);
router.use('/:instanceId/queries', queryRouter);

router.get('/', 
  passport.authenticate('jwt', {session: false}),
  async (req, res, next) => {
    try {
      const userId = req.user.sub;
      const instances = await service.findByUserBasic(userId);
      res.json(instances);
    } catch (error) {
      next(error);
    }
});

router.get('/all', 
  passport.authenticate('jwt', {session: false}),
  checkRoles('admin'),
  async (req, res, next) => {
    try {
      const instances = await service.find();
      res.json(instances);
    } catch (error) {
      next(error);
    }
});

router.get('/:instanceId',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      const relationships = await service.checkInstancesByUser(instanceId, userId);
      if(relationships.length === 0) throw boom.unauthorized();
      const instance = await service.findOneFULL(instanceId);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(createInstanceSchema, 'body'),
  async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const body = req.body;
        body.userId = userId;
        const newinstance = await service.create(body);
        res.status(201).json(newinstance);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(updateInstanceSchema, 'body'),
  async (req, res, next) => {
    try {
      const userId = req.user.sub;
      const relationships = await service.checkInstancesByUser(body.id, userId);
      if(relationships.length === 0) throw boom.unauthorized();

      const body = req.body;
      const instance = await service.update(body);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:instanceId',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      await service.delete(instanceId);
      res.status(201).json({instanceId});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

