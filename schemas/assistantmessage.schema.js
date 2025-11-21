const Joi = require('joi');

const id = Joi.string();
const message = Joi.string();
const type = Joi.string();
const lang = Joi.string();
const assistantId = Joi.string();
const instanceId = Joi.string();

const createAssistantMessageSchema = Joi.object({
  message: message.required(),
  type: type.required(),
  lang: lang.required(),
  assistantId: assistantId.required(),
});

const updateAssistantMessageSchema = Joi.object({
  id: id.required(),
  message: message.required(),
  type: type.required(),
  lang: lang.required(),
  assistantId: assistantId.required(),
});

const getAssistantMessageSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = {
  createAssistantMessageSchema,
  updateAssistantMessageSchema,
  getAssistantMessageSchema,
};
