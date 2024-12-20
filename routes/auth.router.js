/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
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
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     description: Autentica a un usuario utilizando email y contraseña y devuelve un token JWT.
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
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Usuario autenticado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Credenciales inválidas.
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
 *     summary: Verificar token
 *     tags: [Auth]
 *     description: Verifica la validez de un token JWT.
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
 *         description: Token verificado correctamente.
 *       400:
 *         description: Token inválido.
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
 *     summary: Cambiar contraseña
 *     tags: [Auth]
 *     description: Cambia la contraseña de un usuario autenticado.
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
 *         description: Contraseña cambiada correctamente.
 *       401:
 *         description: No autorizado o contraseña actual incorrecta.
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
