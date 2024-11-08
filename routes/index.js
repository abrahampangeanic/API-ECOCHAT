const express = require('express');

const authRouter = require('./auth.router');
const profileRouter = require('./profile.router');

const instanceRouter = require('./instance.router');
const documentRouter = require('./document.router');
const sessionRouter = require('./session.router');
const queryRouter = require('./query.router');
const questionRouter = require('./question.router');

// const productsRouter = require('./products.router');
// const categoriesRouter = require('./categories.router');
// const usersRouter = require('./users.router');
// const orderRouter = require('./orders.router');

// const suscriptionRouter = require('./suscription.router');
// const reportRouter = require('./report.router');


function routerApi(app) {
  const router = express.Router();

  app.use('/api/v1', router);
  router.use('/auth', authRouter);
  // router.use('/customers', profileRouter);
  router.use('/register', profileRouter);
  router.use('/instances', instanceRouter);
  router.use('/documents', documentRouter);
  router.use('/sessions', sessionRouter);
  router.use('/queries', queryRouter);
  router.use('/questions', questionRouter);
}

module.exports = routerApi;
