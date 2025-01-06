/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Endpoints for managing sessions
 */

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get a list of sessions
 *     tags: [Sessions]
 *     description: Get a list of sessions for an user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the instance
 *     responses:
 *       200:
 *         description: List of sessions obtained successfully.
 *       401:
 *         description: Unauthorized. The token JWT is invalid or the user does not have permissions. 
 *       403:
 *         description: Forbidden. The user does not have access to this instance.
 *       500:
 *         description: Internal Server Error.      
 */

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     description: Create a new session. Requires authentication with JWT.
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
 *               - assistantId
 *             properties:
 *               name:
 *                 type: string
 *                 description: name.
 *               assistantId:
 *                 type: string
 *                 description: ID of the assistant.
 *     responses:
 *       201:
 *         description: Session created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session created
 *             example:
 *               id: "32592ee7-7a07-46c0-987d-952b94300df6"
 *               createdAt: "2025-01-03T08:51:26.181Z"
 *               name: "new session"
 *               assistantId: "22deccd5-3cb2-425f-b1ac-6c89bcc9b24f"
 *               userId: "32592ee7-7a07-46c0-987d-952b94300df6"
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
 * /sessions/public:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     description: Create a new session. Requires authentication with JWT.
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
 *               - assistantId
 *             properties:
 *               name:
 *                 type: string
 *                 description: name.
 *               assistantId:
 *                 type: string
 *                 description: ID of the assistant.
 *     responses:
 *       201:
 *         description: Session created successfully.
 *         content:
 *           application/json:            
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 1b3bd066-af2f-4ffd-955a-56bac7e5088d
 *             example:
 *               id: "32592ee7-7a07-46c0-987d-952b94300df6"
 *               createdAt: "2025-01-03T08:51:26.181Z"
 *               name: "new session"
 *               assistantId: "22deccd5-3cb2-425f-b1ac-6c89bcc9b24f"
 *               userId: 0
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