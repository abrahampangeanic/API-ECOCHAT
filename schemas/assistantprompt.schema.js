const Joi = require('joi');

const id = Joi.number();
const assistantId = Joi.string();
const promptId = Joi.string();
const instanceId = Joi.string();

const createAssistantPromptSchema = Joi.object({
  assistantId: assistantId.required(),
  promptId: promptId.required(),
});

const updateAssistantPromptSchema = Joi.object({
  id: id.required(),
  assistantId: assistantId.required(),
  promptId: promptId.required(),
});

const getAssistantPromptSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = {
  createAssistantPromptSchema,
  updateAssistantPromptSchema,
  getAssistantPromptSchema,
};
