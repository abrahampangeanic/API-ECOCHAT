/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints to authenticate
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     description: Authenticates a user using email and password and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "admin@admin.com"
 *               password:
 *                 type: string
 *                 example: "Password123*"
 *     responses:
 *       200:
 *         description: User successfully authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid credentials.
 */

/**
 * @swagger
 * /auth/verify_token:
 *   post:
 *     summary: Verify token
 *     tags: [Auth]
 *     description: Verifies the validity of a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               api_token:
 *                 type: string
 *                 example: "your-token-here"
 *     responses:
 *       200:
 *         description: Token successfully verified.
 *       400:
 *         description: Invalid token.
 */

// /**
//  * @swagger
//  * /service/ecochat/api/v1/auth/recovery:
//  *   post:
//  *     summary: Recuperar cuenta
//  *     tags: [Auth]
//  *     description: Envía un correo electrónico para la recuperación de cuenta.
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 example: "user@example.com"
//  *     responses:
//  *       200:
//  *         description: Correo de recuperación enviado correctamente.
//  *       404:
//  *         description: Usuario no encontrado.
//  */

// /**
//  * @swagger
//  * /service/ecochat/api/v1/auth/lost-password:
//  *   post:
//  *     summary: Restablecer contraseña
//  *     tags: [Auth]
//  *     description: Restablece la contraseña utilizando un token de recuperación.
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               token:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Contraseña restablecida correctamente.
//  *       400:
//  *         description: Token inválido o expirado.
//  */

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change Password
 *     tags: [Auth]
 *     description: Change the password of an authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       401:
 *         description: Unauthorized or current password incorrect.
 */