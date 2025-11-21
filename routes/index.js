const express = require('express');

const v1Router = require('./v1');
const v2Router = require('./v2');

function routerApi(app) {
  const router = express.Router();

  app.use('/service/ecochat/api', router);
  router.use('/v1', v1Router);
  router.use('/v2', v2Router);
}

module.exports = routerApi;
