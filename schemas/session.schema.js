const Joi = require('joi');

const id = Joi.string();
const name = Joi.string();
const instanceId = Joi.string();

const createSessionSchema = Joi.object({
    name: name.required(),
});

const updateSessionSchema = Joi.object({
    id: id.required(),
    name: name.required(),
});

const getSessionSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createSessionSchema, updateSessionSchema, getSessionSchema }