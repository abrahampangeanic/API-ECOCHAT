const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');

const AssistantPromptService = require('../services/assistantprompt.service');
const service = new AssistantPromptService();
const InstanceService = require('../services/instance.service');
const instanceServ = new InstanceService();

const validatorHandler = require('../middlewares/validator.handler');
const { getInstanceSchema} = require('../schemas/instance.schema');
const { getAssistantPromptSchema, createAssistantPromptSchema } = require('../schemas/assistantprompt.schema');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: AssistantPrompts
 *   description: Endpoints for managing assistant prompts
 */

/**
 * @swagger
 * /instances/{instanceId}/assistantprompts:
 *   post:
 *     summary: Add an assistant prompt
 *     tags: [AssistantPrompts]
 *     description: Add a prompt to an assistant. Requires authentication with JWT.
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
 *               - promptId
 *             properties:
 *               assistantId:
 *                 type: string
 *                 description: ID del asistente a actualizar.
 *               promptId:
 *                 type: string
 *                 description: ID de la pregunta a actualizar.
 *           example:
 *             assistantId: "123e4567-e89b-12d3-a456-426614174000"
 *             promptId: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: add assistant prompts successfully.
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
 *                   promptId:
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

/**
 * @swagger
 * /instances/{instanceId}/assistantprompts/{id}:
 *   delete:
 *     summary: Delete an assistant prompt
 *     description: |
 *       This endpoint allows you to delete a specific assistant prompt by its `Id` and its `instanceId`.
 *       Requires authentication with JWT and specific roles.
 *     tags: [AssistantPrompts]
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
 *         description: El ID de la pregunta a eliminar.
 *         schema:
 *           type: string
 *     security:        
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pregunta de asistentes eliminada
 *         content:
 *           application/json:
 *             schema:  
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: AssistantPrompt deleted
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
 *         description: Pregunta de asistentes no encontrada
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

