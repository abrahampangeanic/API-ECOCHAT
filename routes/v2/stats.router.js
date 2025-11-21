const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const SessionService = require('../../services/session.service');
const sessionServ = new SessionService();

const InstanceService = require('../../services/instance.service');
const instanceServ = new InstanceService();

const QueryService = require('../../services/query.service');
const queryServ = new QueryService();

const validatorHandler = require('../../middlewares/validator.handler');
const { getInstanceSchema} = require('../../schemas/instance.schema');

const router = express.Router({ mergeParams: true });

router.get('/queries', 
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const rta = await queryServ.CountbyInstance(instanceId);

      res.json(rta);
    
    } catch (error) {
      next(error);
    }
});

router.get('/tokens', 
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const rta = await queryServ.getCurrentYearTokensSum(instanceId);

      res.json(rta);
    
    } catch (error) {
      next(error);
    }
});

router.get('/skills', 
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;

      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const rta = await queryServ.countQueriesByType(instanceId);

      res.json(rta);
    
    } catch (error) {
      next(error);
    }
});

module.exports = router;

