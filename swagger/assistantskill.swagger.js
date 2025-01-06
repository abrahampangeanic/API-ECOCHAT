/**
 * @swagger
 * tags:
 *   name: AssistantSkills
 *   description: Endpoints for managing assistant skills
 */

/**
 * @swagger
 * /instances/{instanceId}/assistantskills:
 *   post:
 *     summary: Add an assistant skill
 *     tags: [AssistantSkills]
 *     description: Add an assistant skill. Requires authentication with JWT.
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
 *               - skillId
 *             properties:
 *               assistantId:
 *                 type: string
 *                 description: ID del asistente a actualizar.
 *               skillId:
 *                 type: string
 *                 description: ID de la habilidad a actualizar.
 *           example:
 *             assistantId: "123e4567-e89b-12d3-a456-426614174000"
 *             skillId: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: add assistant skills successfully.
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
 *                   skillId:
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174001"
 *       401:
 *         description: No autorizado. El token JWT es inválido o el usuario no tiene permisos.
 *       403:
 *         description: Prohibido. El usuario no tiene acceso a esta instancia.
 *       500:
 *         description: Error interno del servidor.
 */

/**
 * @swagger
 * /instances/{instanceId}/assistantskills/{id}:
 *   delete:
 *     summary: Delete an assistant skill
 *     description: |
 *       This endpoint allows you to delete a specific assistant skill by its `Id` and its `instanceId`.
 *       Requires authentication with JWT and specific roles.
 *     tags: [AssistantSkills]
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
 *         description: El ID de la habilidad a eliminar.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Habilidad de asistentes eliminada
 *         content:
 *           application/json:
 *             schema:  
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: AssistantSkill deleted
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
 *         description: Habilidad de asistentes no encontrada
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