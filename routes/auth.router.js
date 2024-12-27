/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints to authenticate
 */

const express = require('express');
const passport = require('passport');

const AuthService = require('./../services/auth.service');
const { changePasswordSchema } = require('../schemas/user.schema');
const validatorHandler = require('./../middlewares/validator.handler');

const router = express.Router();
const service = new AuthService();

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
router.post('/login',
  passport.authenticate('local', {session: false}),
  async (req, res, next) => {
    try {
      const user = req.user;
      res.json(service.signToken(user));
    } catch (error) {
      next(error);
    }
  }
);

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
router.post('/verify_token',
  async (req, res, next) => {
    try {
      const { api_token } = req.body;
      res.json( await service.verify_token(api_token))
    } catch (error) {
      next(error);
    }
  }
);

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
router.post('/recovery',
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const rta = await service.sendRecovery(email);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

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
router.post('/lost-password',
  async (req, res, next) => {
    try {
      const { token, password } = req.body;
      const rta = await service.lostPassword(token, password);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

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
router.post('/change-password',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(changePasswordSchema, 'body'),
  async (req, res, next) => {
    try {
      // const userId = req.user.sub;
      const { userId, newPassword } = req.body;
      const rta = await service.changePassword(userId, newPassword);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
