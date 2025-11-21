const Joi = require('joi');

const id = Joi.string();
const name = Joi.string();
const description = Joi.string();
const prompt = Joi.string();
const lang = Joi.string();
const type = Joi.string();
const skill = Joi.string();
const shared = Joi.number().integer().allow(null);
const instanceId = Joi.string();

const createPromptSchema = Joi.object({
  name: name.required(),
  description: description.required(),
  prompt: prompt.required(),
  type: type.required(),
  skill: skill.required(),
  lang: lang.required(),
  shared: shared.required(),
});

const updatePromptSchema = Joi.object({
  id: id.required(),
  name: name.required(),
  description: description.required(),
  prompt: prompt.required(),
  type: type,
  skill: skill,
  lang: lang,
  shared: shared,
});

const getPromptSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createPromptSchema, updatePromptSchema, getPromptSchema };
