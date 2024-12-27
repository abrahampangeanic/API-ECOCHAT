const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const AssistantCollectionService = require('../services/assistantcollection.service');
const service = new AssistantCollectionService();
const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();

const validatorHandler = require('../middlewares/validator.handler');
const { getInstanceSchema} = require('../schemas/instance.schema');
const { createAssistantCollectionSchema, getAssistantCollectionSchema } = require('../schemas/assistantcollection.schema');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: AssistantCollections
 *   description: Endpoints for managing assistant collections
 */

/**
 * @swagger
 * /instances/{instanceId}/assistantcollections:
 *   post:
 *     summary: Add a collection to an assistant
 *     tags: [AssistantCollections]
 *     description: Add a collection to an assistant. Requires authentication with JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la instancia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assistantId
 *               - collectionId
 *             properties:
 *               assistantId:
 *                 type: string
 *                 description: ID del asistente a actualizar.
 *               collectionId:
 *                 type: string
 *                 description: ID de la colección a actualizar.
 *           example:
 *             assistantId: "123e4567-e89b-12d3-a456-426614174000"
 *             collectionId: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Lista de colecciones de asistentes obtenida correctamente.
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
 *                   assistantId:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   collectionId:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174001"
 *       401:
 *         description: No autorizado. El token JWT es inválido o el usuario no tiene permisos.
 *       403:
 *         description: Prohibido. El usuario no tiene acceso a esta instancia.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getInstanceSchema, 'params'),
  validatorHandler(createAssistantCollectionSchema, 'body'),
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

/**
 * @swagger
 * /instances/{instanceId}/assistantcollections/{id}:
 *   delete:
 *     summary: Delete a collection of attendees
 *     description: |
 *       This endpoint allows you to delete a specific attendee collection by its `Id` and its `instanceId`.
 *       Requires authentication with JWT and specific roles.
 *     tags: [AssistantCollections]
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
 *         description: El ID de la colección a eliminar.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Colección de asistentes eliminada
 *         content:
 *           application/json:
 *             schema:  
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: AssistantCollection deleted
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
 *         description: Colección de asistentes no encontrada
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
router.delete('/:id',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getAssistantCollectionSchema, 'params'),
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

