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
 *     summary: Get instances of the authenticated user
 *     tags: [Instances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of instances
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Instance'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /instances/{instanceId}:
 *   get:
 *     summary: Get an instance by ID
 *     description: |
 *       This endpoint allows you to get detailed information about a specific instance by its `instanceId`.
 *       Requires authentication with JWT and specific roles.
 *     tags: [Instances]
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         description: The ID of the instance to get.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instance information
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
 *         description: Access denied
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
 *         description: Internal Server Error
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
 * /instances:
 *   post:
 *     summary: Create a new instance
 *     description: |
 *       This endpoint allows you to create a new instance
 *       Requires JWT authentication.
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
 *                 description: Instance name
 *               client_name:
 *                 type: string
 *                 description: Name of the associated client.
 *               base_url:
 *                 type: string
 *                 description: URL of the instance.
 *               description:
 *                 type: string
 *                 description: Detailed description of the instance.
 *               type:
 *                 type: string
 *                 description: Instance type.
 *               lang:
 *                 type: string
 *                 description: Language configured for the instance.
 *           example:
 *             name: "Gestión de Proyectos"
 *             client_name: "Cliente XYZ"
 *             base_url: "https://proyectos.cliente-xyz.com"
 *             description: "Instancia dedicada a la gestión de proyectos de la empresa Cliente XYZ."
 *             type: "BASIC"
 *             lang: "ES"
 *     responses:
 *       201:
 *         description: Instance created successfully.
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
 *         description: Invalid data in the application
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
 *         description: Internal Server Error
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
 * /instances/{instanceId}:
 *   patch:
 *     summary: Update an instance
 *     description: |
 *       This endpoint allows you to update detailed information about a specific instance by its `instanceId`.
 *       Requires authentication with JWT and specific roles.
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

/**
 * @swagger
 * /instances/{instanceId}:
 *   delete:
 *     summary: Delete an instance
 *     description: |
 *       This endpoint allows you to delete a specific instance by its `instanceId`.
 *       Requires authentication with JWT and specific roles.
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