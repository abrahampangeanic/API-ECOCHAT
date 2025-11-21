const Joi = require('joi');

const id = Joi.string();
const name = Joi.string();
const assistantId = Joi.string();

const createSessionSchema = Joi.object({
  name: name.required(),
  assistantId: assistantId.required(),
});

const updateSessionSchema = Joi.object({
  id: id.required(),
  name: name.required(),
});

const getSessionSchema = Joi.object({
  id: id.required(),
});

const getSessionByAssitantSchema = Joi.object({
  assistantId: assistantId.required(),
});

module.exports = {
  createSessionSchema,
  updateSessionSchema,
  getSessionSchema,
  getSessionByAssitantSchema,
};
