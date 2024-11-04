const boom = require('@hapi/boom');
const { config } = require('../config/config');
const ApiKeyService = require('../services/apikey.service');
const apikeyService = new ApiKeyService();

function checkApiToken(req, res, next) {
  const apiKey = req.headers['api'];
  if (apiKey === config.apiKey) {
    next();
  } else {
    next(boom.unauthorized());
  }
}

async function checkApiKey(req, res, next) {
  const apiKey = req.headers['apikey'];
  if (!apiKey)   next(boom.badRequest('apikey not found'));
  
  try {
    const apiKeyRecord = await apikeyService.findByKey(apiKey);
    if (!apiKeyRecord) next(boom.unauthorized());
    next();
  } catch (error) {
    next(boom.internalServerError(error.message));
  }
}

function checkAdminRole(req, res, next) {
  const user = req.user;
  if (user.role === 'admin')  next();
  else  next(boom.unauthorized());
}


function checkRoles(...roles) {
  return (req, res, next) => {
    const user = req.user;
    console.log(user);
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
