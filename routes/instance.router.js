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

/**
 * @swagger
 * tags:
 *   name: Instances
 *   description: Endpoints to Instances
 */

/**
 * @swagger
 * /instances:
 *   get:
 *     summary: Obtener instancias del usuario autenticado
 *     tags: [Instances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de instancias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Instance'
 *       401:
 *         description: No autorizado
 */
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
  checkRoles('SUPER'),
  async (req, res, next) => {
    try {
      const instances = await service.find();
      res.json(instances);
    } catch (error) {
      next(error);
    }
});

/**
 * @swagger
 * /instances/{instanceId}:
 *   get:
 *     summary: Obtiene una instancia por ID
 *     description: |
 *       Este endpoint permite obtener la información detallada de una instancia específica por su `instanceId`.
 *       Requiere autenticación con JWT y roles específicos.
 *     tags: [Instances]
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         description: El ID de la instancia a obtener.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de la instancia
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instance'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Access Denied
 *       404:
 *         description: Instancia no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Instance not found
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get('/:instanceId',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;

      if(req.user.role !== 'SUPER') {
        const relationships = await service.checkInstancesByUser(instanceId, userId);
        if(relationships.length === 0) throw boom.unauthorized();
      }

      const instance = await service.findOneFULL(instanceId);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);


/**
 * @swagger
 * /instances:
 *   post:
 *     summary: Crea una nueva instancia
 *     description: |
 *       Este endpoint permite crear una nueva instancia. 
 *       Requiere autenticación con JWT.
 *     tags: [Instances]
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
 *               - client_name
 *               - description
 *               - type
 *               - lang
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la instancia.
 *               client_name:
 *                 type: string
 *                 description: Nombre del cliente asociado.
 *               base_url:
 *                 type: string
 *                 description: URL base de la instancia.
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la instancia.
 *               type:
 *                 type: string
 *                 description: Tipo de la instancia.
 *               lang:
 *                 type: string
 *                 description: Idioma configurado para la instancia.
 *               logo:
 *                 type: string
 *                 nullable: true
 *                 description: Logo de la instancia.
 *           example:
 *             name: "Gestión de Proyectos"
 *             client_name: "Cliente XYZ"
 *             base_url: "https://proyectos.cliente-xyz.com"
 *             description: "Instancia dedicada a la gestión de proyectos de la empresa Cliente XYZ."
 *             type: "BASIC"
 *             lang: "ES"
 *     responses:
 *       201:
 *         description: Instancia creada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instance'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Gestión de Proyectos"
 *               client_name: "Cliente XYZ"
 *               base_url: "https://proyectos.cliente-xyz.com"
 *               description: "Instancia dedicada a la gestión de proyectos de la empresa Cliente XYZ."
 *               type: "Gestión"
 *               lang: "es"
 *               logo: "https://proyectos.cliente-xyz.com/logo.png"
 *               userId: "456e1237-d89c-45f3-b756-526614174111"
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
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Error interno del servidor
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

/**
 * @swagger
 * /instances/{instanceId}:
 *   patch:
 *     summary: Actualiza una instancia
 *     description: |
 *       Este endpoint permite actualizar la información detallada de una instancia específica por su `instanceId`.
 *       Requiere autenticación con JWT y roles específicos.
 *     tags: [Instances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - instanceId 
 *               - name
 *               - client_name
 *               - description
 *               - type
 *               - lang
 *             properties:
 *               instanceId:
 *                 type: string
 *                 description: ID de la instancia a actualizar.
 *               name:
 *                 type: string
 *                 description: Nombre de la instancia.
 *               client_name:
 *                 type: string
 *                 description: Nombre del cliente asociado.
 *               base_url:
 *                 type: string
 *                 description: URL base de la instancia.
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la instancia.
 *               type:
 *                 type: string
 *                 description: Tipo de la instancia.
 *               lang:
 *                 type: string
 *                 description: Idioma configurado para la instancia.
 *               logo:
 *                 type: string
 *                 nullable: true
 *                 description: Logo de la instancia.
 *           example:
 *             instanceId: "123e4567-e89b-12d3-a456-426614174000"
 *             name: "Gestión de Proyectos"
 *             client_name: "Cliente XYZ"
 *             base_url: "https://proyectos.cliente-xyz.com"
 *             description: "Instancia dedicada a la gestión de proyectos de la empresa Cliente XYZ."
 *             type: "BASIC"
 *             lang: "ES"
 *     responses:
 *       200:
 *         description: Instancia actualizada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instance'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Gestión de Proyectos"
 *               client_name: "Cliente XYZ"
 *               base_url: "https://proyectos.cliente-xyz.com"
 *               description: "Instancia dedicada a la gestión de proyectos de la empresa Cliente XYZ."
 *               type: "BASIC"
 *               lang: "ES"
 *               logo: "https://proyectos.cliente-xyz.com/logo.png"
 *               userId: "456e1237-d89c-45f3-b756-526614174111"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Access Denied
 *       404:
 *         description: Instancia no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Instance not found
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.patch('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(updateInstanceSchema, 'body'),
  async (req, res, next) => {
    try {
      if(req.user.role !== 'SUPER')  throw boom.unauthorized();
      const body = req.body;
      const instance = await service.update(body);
      res.json(instance);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /instances/{instanceId}:
 *   delete:
 *     summary: Elimina una instancia
 *     description: |
 *       Este endpoint permite eliminar una instancia específica por su `instanceId`.
 *       Requiere autenticación con JWT y roles específicos.
 *     tags: [Instances]
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         description: El ID de la instancia a eliminar.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instancia eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Instance deleted
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Acceso denegado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Access Denied
 *       404:
 *         description: Instancia no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Instance not found
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */
router.delete('/:instanceId',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      if(req.user.role !== 'SUPER')  throw boom.unauthorized();
      const { instanceId } = req.params;
      await service.delete(instanceId);
      res.status(201).json({instanceId});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

