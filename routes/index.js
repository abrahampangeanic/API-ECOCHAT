const express = require('express');

const authRouter = require('./auth.router');
const profileRouter = require('./profile.router');

const instanceRouter = require('./instance.router');
const documentRouter = require('./document.router');

// const productsRouter = require('./products.router');
// const categoriesRouter = require('./categories.router');
// const usersRouter = require('./users.router');
// const orderRouter = require('./orders.router');


// const profileRouter = require('./profile.router');

// const suscriptionRouter = require('./suscription.router');
// const reportRouter = require('./report.router');


function routerApi(app) {
  const router = express.Router();

  app.use('/api/v1', router);
  router.use('/auth', authRouter);
  router.use('/customers', profileRouter);
  router.use('/register', profileRouter);
  router.use('/instances', instanceRouter);
  router.use('/documents', documentRouter);
  
  // router.use('/products', productsRouter);
  // router.use('/categories', categoriesRouter);
  // router.use('/users', usersRouter);
  // router.use('/orders', orderRouter);


  // router.use('/profile', profileRouter);

  // router.use('/suscription', suscriptionRouter);
  // router.use('/report', reportRouter);
}

module.exports = routerApi;
