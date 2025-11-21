const Joi = require('joi');

const id = Joi.string();
const name = Joi.string();
const description = Joi.string();
const instanceId = Joi.string();

const createGroupSchema = Joi.object({
  name: name.required(),
  description: description.required(),
});

const updateGroupSchema = Joi.object({
  id: id.required(),
  name: name.required(),
  description: description.required(),
});

const getGroupSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createGroupSchema, updateGroupSchema, getGroupSchema };
