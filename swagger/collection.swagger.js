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