/**
 * @swagger
 * tags:
 *   name: CollectionSources
 *   description: Endpoints para gestionar fuentes de colecciones
 */

/**
 * @swagger
 * /instances/{instanceId}/collectionsources:
 *   post:
 *     summary: Obtener todas las fuentes de colecciones de una instancia
 *     tags: [CollectionSources]
 *     description: Recupera una lista de fuentes de colecciones asociadas a una instancia específica. Requiere autenticación con token JWT.
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
 *               - collectionId
 *               - sourceId
 *             properties:
 *               collectionId:
 *                 type: string
 *                 description: ID de la colección a actualizar.
 *               sourceId:
 *                 type: string
 *                 description: ID de la fuente a actualizar.
 *           example:
 *             collectionId: "123e4567-e89b-12d3-a456-426614174000"
 *             sourceId: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Lista de fuentes de colecciones obtenida correctamente.
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
 *                   collectionId:                    
 *                     type: string
 *                     example: "123e4567-e89b-12d3-a456-426614174000"
 *                   sourceId:
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
 * /instances/{instanceId}/collectionsources/{id}:
 *   delete:
 *     summary: Elimina un sources de una coleccion
 *     description: |
 *       Este endpoint permite eliminar un source de una colección específica por su `Id` y su `instanceId`.
 *       Requiere autenticación con JWT y roles específicos.
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
 *         description: Source de colección eliminada
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