const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const QueryService = require('../../services/query.service');
const service = new QueryService();

const InstanceService = require('../../services/instance.service');
const instanceServ = new InstanceService();

const validatorHandler = require('../../middlewares/validator.handler');
const { getInstanceSchema } = require('../../schemas/instance.schema');
const { updateQuerySchema } = require('../../schemas/query.schema');

const router = express.Router({ mergeParams: true });

router.patch(
  '/',
  // passport.authenticate('jwt', {session: false}),
  validatorHandler(updateQuerySchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const query = await service.update(body);
      res.json(query);
    } catch (error) {
      next(error);
    }
  }
);

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

      const query = await service.findByInstance(instanceId);
      res.json(query);
    } catch (error) {
      next(error);
    }
  }
);

// router.get('/:id',
//   passport.authenticate('jwt', {session: false}),
//   validatorHandler(getQuerySchema, 'params'),
//   async (req, res, next) => {
//     try {
//       const { instanceId, id } = req.params;
//       const userId = req.user.sub;

//       const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
//       if(relationships.length === 0) throw boom.unauthorized();

//       const instance = await service.findOne(id);
//       res.json(instance);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post('/',
//   passport.authenticate('jwt', {session: false}),
//   validatorHandler(getInstanceSchema, 'params'),
//   validatorHandler(createQuerySchema, 'body'),
//   async (req, res, next) => {
//     try {
//         const { instanceId  } = req.params;
//         const userId = req.user.sub;
//         const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
//         if(relationships.length === 0) throw boom.unauthorized();

//         const body = req.body;
//         body.instanceId = instanceId;
//         const query = await service.create(body);
//         res.status(201).json(query);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.delete('/:id',
//   passport.authenticate('jwt', {session: false}),
//   validatorHandler(getQuerySchema, 'params'),
//   async (req, res, next) => {
//     try {
//       const { instanceId, id } = req.params;
//       const userId = req.user.sub;
//       const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
//       if(relationships.length === 0) throw boom.unauthorized();

//       await service.delete(id);
//       res.status(201).json({id});
//     } catch (error) {
//       next(error);
//     }
//   }
// );

module.exports = router;
