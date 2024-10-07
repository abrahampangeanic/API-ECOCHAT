const express = require('express');
const passport = require('passport');

const AuthService = require('../services/auth.service');
const ProfileService = require('../services/profile.service');

const validationHandler = require('../middlewares/validator.handler');
const { checkAdminRole } = require('../middlewares/auth.handler');
const { createProfileSchema, getProfileSchema, updateProfileSchema} = require('../schemas/profile.schema');

const router = express.Router({ mergeParams: true });
const service = new ProfileService();
const auth = new AuthService();

router.post('/',
  passport.authenticate('jwt', {session: false}),
  checkAdminRole,
  validationHandler(createProfileSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const profile = await service.create(body);
      const api_token =  auth.signToken(profile.user);
      res.status(201).json(api_token);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/',
  passport.authenticate('jwt', {session: false}),
  validationHandler(updateProfileSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      body.id = req.user.sub;
      const profile = await service.update( body);
      res.status(201).json(profile);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validationHandler(getProfileSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      res.status(200).json(await service.delete(id));
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
