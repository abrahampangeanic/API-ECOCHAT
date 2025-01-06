/**
 * @swagger
 * tags:
 *   name: Source
 *   description: Endpoints for managing data sources
 */

/**
 * @swagger
 * /instances/{instanceId}/sources:
 *   get:
 *     summary: Get a list of data sources
 *     tags: [Source]
 *     description: Get a list of data sources for an instance
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
 *         description: List of data sources obtained successfully.
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
 *                   sourcetype:
 *                     type: string
 *                     example: "WEB"
 *                   reference:
 *                     type: string
 *                     example: "https://www.economia.gob.ar"
 *                   web_connector_type:
 *                     type: string
 *                     example: "SINGLE"
 *                   indexstatus:
 *                     type: number
 *                     example: 0
 *                   pages:
 *                     type: number
 *                     example: 0
 *       401:
 *         description: No autorizado. El token JWT es inválido o el usuario no tiene permisos.
 *       403:
 *         description: Prohibido. El usuario no tiene acceso a esta instancia.
 *       500:
 *         description: Error interno del servidor.
 */

/**
 * @swagger
 * /instances/{instanceId}/sources/file:
 *   post:
 *     summary: Add a data source to an instance
 *     tags: [Source]
 *     description: Add a data source to an instance. Requires authentication with JWT and specific roles.
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - files
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la fuente de datos.
 *               description:
 *                 type: string
 *                 description: Descripción de la fuente de datos.
 *               files:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir.
 *     responses:
 *       200:
 *         description: Data source added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Source added
 *       400:
 *         description: Solicitud inválida. Los parámetros o el archivo están incompletos o no son válidos.
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

/**
 * @swagger
 * /instances/{instanceId}/sources/web:
 *   post:
 *     summary: Add a web data source to an instance
 *     tags: [Source]
 *     description: Add a web data source to an instance. Requires authentication with JWT and specific roles.
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
 *               - name
 *               - description
 *               - sourcetype
 *               - reference
 *               - web_connector_type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la fuente de datos.
 *               description:
 *                 type: string
 *                 description: Descripción de la fuente de datos.
 *               sourcetype:
 *                 type: string
 *                 description: Tipo de fuente de datos.
 *               reference:
 *                 type: string
 *                 description: URL de la fuente de datos.
 *               web_connector_type:
 *                 type: string
 *                 description: Tipo de conector web.
 *                 enum:
 *                   - SINGLE
 *                   - RECURSIVE                 
 *     responses:
 *       200:
 *         description: Data source added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Source added
 *       401:
 *         description: No autorizado. El token JWT es inválido o el usuario no tiene permisos.
 *       403:
 *         description: Prohibido. El usuario no tiene acceso a esta instancia.
 *       500:
 *         description: Error interno del servidor.
 */