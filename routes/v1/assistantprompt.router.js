const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const AssistantPromptService = require('../../services/assistantprompt.service');
const service = new AssistantPromptService();
const InstanceService = require('../../services/instance.service');
const instanceServ = new InstanceService();

const validatorHandler = require('../../middlewares/validator.handler');
const { getInstanceSchema} = require('../../schemas/instance.schema');
const { getAssistantPromptSchema, createAssistantPromptSchema } = require('../../schemas/assistantprompt.schema');

const router = express.Router({ mergeParams: true });

router.post('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createAssistantPromptSchema, 'body'),
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
        res.status(201).json(collection);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getAssistantPromptSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;
      
      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      await service.delete(id);
      res.status(201).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

