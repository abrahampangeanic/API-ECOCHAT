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
const { getSessionSchema, updateSessionSchema, createSessionSchema, getSessionByAssitantSchema } = require('../schemas/session.schema');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Endpoints for managing sessions
 */

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get a list of sessions
 *     tags: [Sessions]
 *     description: Get a list of sessions for an user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the instance
 *     responses:
 *       200:
 *         description: List of sessions obtained successfully.
 *       401:
 *         description: Unauthorized. The token JWT is invalid or the user does not have permissions. 
 *       403:
 *         description: Forbidden. The user does not have access to this instance.
 *       500:
 *         description: Internal Server Error.      
 */
router.get('/', 
  passport.authenticate('jwt', {session: false}),
  async (req, res, next) => {
    try {
      const userId = req.user.sub;
      const session = await service.findByUser(userId);
      res.json(session);
    } catch (error) {
      next(error);
    }
});

router.get('/assistant/:assistantId',
  passport.authenticate('jwt', {session: false}),
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
});

router.get('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getSessionSchema, 'params'),
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

router.get('/:id/query',
  passport.authenticate('jwt', {session: false}),
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

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     description: Create a new session. Requires authentication with JWT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - assistantId
 *             properties:
 *               name:
 *                 type: string
 *                 description: name.
 *               assistantId:
 *                 type: string
 *                 description: ID of the assistant.
 *     responses:
 *       201:
 *         description: Session created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session created
 *       400:
 *         description: Datos inválidos en la solicitud
 *         content:
 *           application/json:            
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request 
 *       401:
 *         description: No autorizado. El token JWT es inválido o el usuario no tiene permisos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Prohibido. El usuario no tiene acceso a esta instancia.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.post('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(createSessionSchema, 'body'),
  async (req, res, next) => {
    try {
        const userId = req.user.sub;
        const body = req.body;
        body.userId = userId;
        const session = await service.create(body);
        res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /sessions/public:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     description: Create a new session. Requires authentication with JWT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - assistantId
 *             properties:
 *               name:
 *                 type: string
 *                 description: name.
 *               assistantId:
 *                 type: string
 *                 description: ID of the assistant.
 *     responses:
 *       201:
 *         description: Session created successfully.
 *         content:
 *           application/json:            
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session created
 *       400:
 *         description: Datos inválidos en la solicitud
 *         content:
 *           application/json:            
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request 
 *       401:
 *         description: No autorizado. El token JWT es inválido o el usuario no tiene permisos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Prohibido. El usuario no tiene acceso a esta instancia.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Forbidden
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:                
 *                   type: string
 *                   example: Internal Server Error
 */
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
      if(req.user.role !== 'SUPER') {
        const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
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

router.delete('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getSessionSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

