const express = require('express');
const passport = require('passport');

const AuthService = require('./../services/auth.service');
const CustomerService = require('../services/customers.service');

const validationHandler = require('../middlewares/validator.handler');
const { createCustomerSchema, getCustomerSchema, updateCustomerSchema} = require('../schemas/customer.schema');

const router = express.Router({ mergeParams: true });
const service = new CustomerService();
const auth = new AuthService();

router.post('/',
  validationHandler(createCustomerSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const customer = await service.create(body);
      const api_token =  auth.signToken(customer.user);
      res.status(201).json(api_token);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/',
  passport.authenticate('jwt', {session: false}),
  validationHandler(updateCustomerSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      body.id = req.user.sub;
      const customer = await service.update( body);
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  validationHandler(getCustomerSchema, 'params'),
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
