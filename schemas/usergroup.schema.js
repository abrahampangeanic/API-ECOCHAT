const Joi = require('joi');

const id = Joi.number();
const userId = Joi.string();
const groupId = Joi.string();
const instanceId = Joi.string();

const createUserGroupSchema = Joi.object({
    userId: userId.required(),
    groupId: groupId.required(),
});

const updateUserGroupSchema = Joi.object({
    id: id.required(),
    userId: userId.required(),
    groupId: groupId.required(),
});

const getUserGroupSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createUserGroupSchema, updateUserGroupSchema, getUserGroupSchema }