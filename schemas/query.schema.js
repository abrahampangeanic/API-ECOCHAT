const Joi = require('joi');

const id = Joi.string();
const name = Joi.string();
const assistantId = Joi.string();
const instanceId = Joi.string();

const createQuerySchema = Joi.object({
    name: name.required(),
    assistantId: assistantId.required(),
});

const updateQuerySchema = Joi.object({
    id: id.required(),
    name: name.required(),
});

const getQuerySchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createQuerySchema, updateQuerySchema, getQuerySchema }