const express = require('express');
const passport = require('passport');

const AuthService = require('./../services/auth.service');
const { changePasswordSchema } = require('../schemas/user.schema');
const validatorHandler = require('./../middlewares/validator.handler');

const router = express.Router();
const service = new AuthService();

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

router.post('/change-password',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(changePasswordSchema, 'body'),
  async (req, res, next) => {
    try {
      const userId = req.user.sub;
      const { oldPassword, newPassword } = req.body;
      const rta = await service.changePassword(userId, oldPassword, newPassword);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
