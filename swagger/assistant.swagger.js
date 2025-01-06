/**
 * @swagger
 * tags:
 *   name: Assistants
 *   description: Endpoints to Assistants
 */

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