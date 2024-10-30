const Joi = require('joi');

const id = Joi.number();
const assistantId = Joi.number();
const skillId = Joi.number();
const instanceId = Joi.number();

const createAssistantSkillSchema = Joi.object({
    assistantId: assistantId.required(),
    skillId: skillId.required(),
});

const updateAssistantSkillSchema = Joi.object({
    id: id.required(),
    assistantId: assistantId.required(),
    skillId: skillId.required(),
});

const getAssistantSkillSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createAssistantSkillSchema, updateAssistantSkillSchema, getAssistantSkillSchema }