const Joi = require('joi');

const id = Joi.number();
const assistantId = Joi.number();
const skillId = Joi.number();
const instanceId = Joi.string();

const createUserGroupSchema = Joi.object({
    assistantId: assistantId.required(),
    skillId: skillId.required(),
});

const updateUserGroupSchema = Joi.object({
    id: id.required(),
    assistantId: assistantId.required(),
    skillId: skillId.required(),
});

const getUserGroupSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createUserGroupSchema, updateUserGroupSchema, getUserGroupSchema }