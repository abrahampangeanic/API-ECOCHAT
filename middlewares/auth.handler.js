const boom = require('@hapi/boom');
const { config } = require('../config/config');
const InstanceService = require('../services/instance.service');
const service = new InstanceService();

function checkApiToken(req, res, next) {
  const apiKey = req.headers['api'];
  if (apiKey === config.apiKey) {
    next();
  } else {
    next(boom.unauthorized());
  }
}

function checkApiKey(req, res, next) {
  const apiKey = req.headers['api'];
  if (apiKey === config.apiKey) {
    next();
  } else {
    next(boom.unauthorized());
  }
}

function checkAdminRole(req, res, next) {
  const user = req.user;
  if (user.role === 'admin') {
    next();
  } else {
    next(boom.unauthorized());
  }
}


function checkRoles(...roles) {
  return (req, res, next) => {
    const user = req.user;
    if (roles.includes(user.role)) {
      next();
    } else {
      next(boom.unauthorized());
    }
  }
}

function validatorPropiety() {
  return (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.sub;
    service.checkInstancesByUser(id, userId);
    next();
  }
}



module.exports = { checkApiKey, checkAdminRole, checkRoles, checkApiToken, validatorPropiety }
