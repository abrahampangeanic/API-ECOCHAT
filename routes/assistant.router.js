
/**
 * @swagger
 * tags:
 *   name: Assistants
 *   description: Endpoints to Assistants
 */

const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const AssistantService = require('../services/assistant.service');
const service = new AssistantService();
const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();

const validatorHandler = require('../middlewares/validator.handler');
const { getInstanceSchema} = require('../schemas/instance.schema');
const { getAssistantSchema, updateAssistantSchema, createAssistantSchema } = require('../schemas/assistant.schema');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /instances/{instanceId}/assistants:
 *   get:
 *     summary: Get all attendees of an instance
 *     tags: [Assistants]
 *     description: Retrieves a list of attendees associated with a specific instance. Requires JWT authentication.
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
 *         description: List of assistants obtained successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "abc123"
 *                   name:
 *                     type: string
 *                     example: "Asistente 1"
 *                   description:
 *                     type: string
 *                     example: "Descripción del asistente"
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

      const assistant = await service.findByInstance(instanceId);
      res.json(assistant);
    } catch (error) {
      next(error);
    }
});

/**
 * @swagger
 * /instances/{instanceId}/assistants/public:
 *   get:
 *     summary: Get all public assitants of an instance
 *     tags: [Assistants]
 *     description: Retrieves a list of attendees associated with a specific instance. Requires JWT authentication.
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la instancia
 *     responses:
 *       200:
 *         description: List of public assistants obtained successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "abc123"
 *                   name:
 *                     type: string
 *                     example: "Asistente 1"
 *                   description:
 *                     type: string
 *                     example: "Descripción del asistente"
 *       401:
 *         description: No autorizado. El token JWT es inválido o el usuario no tiene permisos.
 *       403:
 *         description: Prohibido. El usuario no tiene acceso a esta instancia.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/public', 
  validatorHandler(getInstanceSchema, 'params'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const assistant = await service.findByInstancePublic(instanceId);
      res.json(assistant);
    } catch (error) {
      next(error);
    }
});

/**
 * @swagger
 * /instances/{instanceId}/assistants/{id}:
 *   get:
 *     summary: Get an assistant by ID
 *     description: |
 *       This endpoint allows you to get detailed information about a specific assistant by its `Id` and its `instanceId`.
 *       Requires authentication with JWT and specific roles.
 *     tags: [Assistants]
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         description: El ID de la instancia .
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: El ID del asistente.
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
router.get('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getAssistantSchema, 'params'),
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

/**
 * @swagger
 * /instances/{instanceId}/assistants:
 *   post:
 *     summary: Create a new assistant
 *     description: |
 *       This endpoint allows you to create a new assistant.
 *       Requires authentication with JWT and specific roles.
 *     tags: [Assistants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         description: El ID de la instancia .
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - type
 *               - access_type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del asistente.
 *               description:
 *                 type: string
 *                 description: Descripción detallada de la instancia.
 *               type:
 *                 type: string
 *                 description: Tipo de la instancia.
 *               access_type:
 *                 type: string
 *                 description: Idioma configurado para la instancia.
 *           example:
 *             name: "Asistente 1"
 *             description: "Instancia dedicada a la gestión de proyectos de la empresa Cliente XYZ."
 *             type: "CHATBOT"
 *             access_type: "PUBLIC"
 *     responses:
 *       201:
 *         description: Instance created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Instance'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Asistente 1"
 *               description: "Asistente dedicado a la gestión de proyectos de la empresa Cliente XYZ."
 *               type: "CHATBOT"
 *               access_type: "PUBLIC"
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
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createAssistantSchema, 'body'),
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
        const assistant = await service.create(body);
        res.status(201).json(assistant);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /instances/{instanceId}/assistants:
 *   patch:
 *     summary: Update an instance
 *     description: |
 *       This endpoint allows you to update detailed information for a specific assistant by its `Id` and its `instanceId`.
 *       Requires authentication with JWT and specific roles.
 *     tags: [Assistants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         description: El ID de la instancia .
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id 
 *               - name
 *               - description
 *               - type
 *               - access_type
 *             properties:
 *               instanceId:
 *                 type: string
 *                 description: ID del asistente a actualizar.
 *               name:
 *                 type: string
 *                 description: Nombre del asistente.
 *               description:
 *                 type: string
 *                 description: Descripción detallada del asistente.
 *               type:
 *                 type: string
 *                 description: Tipo de asistente.
 *               access_type:
 *                 type: string
 *                 description: Tipo de acceso al asistente.
 *           example:
 *             id: "123e4567-e89b-12d3-a456-426614174000"
 *             name: "Gestión de Proyectos"
 *             description: "Asistente dedicado a la gestión de proyectos de la empresa Cliente XYZ."
 *             type: "CHATBOT"
 *             access_type: "PUBLIC"
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
 *         description: Asistente no encontrado
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
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(updateAssistantSchema, 'body'),
  async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      const userId = req.user.sub;
      const relationships = await instanceServ.checkInstancesByUser(instanceId, userId);
      const body = req.body;
      body.instanceId = instanceId;

      if(relationships.length === 0) throw boom.unauthorized();
      
      const assistant = await service.update(body);
      res.json(assistant);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /instances/{instanceId}/assistants/{id}:
 *   delete:
 *     summary: Delete an assistant
 *     description: |
 *       This endpoint allows you to delete a specific assistant by its `Id` and its `instanceId`.
 *       Requires authentication with JWT and specific roles.
 *     tags: [Assistants]
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         description: El ID de la instancia .
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: El ID del asistente a eliminar.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Asistente eliminado
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
 *         description: Asistente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Assistant not found
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
router.delete('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getAssistantSchema, 'params'),
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

