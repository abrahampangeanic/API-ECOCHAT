const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const CollectionService = require('../services/collection.service');
const service = new CollectionService();
const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();

const validatorHandler = require('../middlewares/validator.handler');
const { getInstanceSchema} = require('../schemas/instance.schema');
const { getCollectionSchema, updateCollectionSchema, createCollectionSchema } = require('../schemas/collection.schema');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: Endpoints for managing collections
 */

/**
 * @swagger
 * /instances/{instanceId}/collections:
 *   get:
 *     summary: Get a list of collections
 *     tags: [Collections]
 *     description: Get a list of collections for an instance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la instancia
 *     responses:
 *       200:
 *         description: List of collections obtained successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:  
 *                     type: number
 *                     example: 1
 *                   instanceId:                    
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   name:
 *                     type: string
 *                     example: "Coleccion de datos"
 *                   description:
 *                     type: string
 *                     example: "Coleccion de datos de prueba"
 *       401:
 *         description: No autorizado. El token JWT es inválido o el usuario no tiene permisos.
 *       403:
 *         description: Prohibido. El usuario no tiene acceso a esta instancia.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', 
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

      const collection = await service.findByInstance(instanceId);
      res.json(collection);
    } catch (error) {
      next(error);
    }
});

router.get('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getCollectionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId, id } = req.params;
      const userId = req.user.sub;
      
      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const instance = await service.findOne(id);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createCollectionSchema, 'body'),
  async (req, res, next) => {
    try {
        const { instanceId  } = req.params;
        const userId = req.user.sub;

        if(req.user.role !== 'SUPER') {
          const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
          if(relationships.length === 0) throw boom.unauthorized();
        }

        const body = req.body;
        body.instanceId = instanceId;
        const collection = await service.create(body);
        res.status(201).json(collection);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(updateCollectionSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;

      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const body = req.body;
      body.instanceId = instanceId;

      const collection = await service.update(body);
      res.json(collection);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getCollectionSchema, 'params'),
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

