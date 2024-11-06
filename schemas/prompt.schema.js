const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const description = Joi.string();
const lang = Joi.string();
const shared = Joi.number().integer().allow(null);;
const include_citacions	 = Joi.number().integer().allow(null);
const datetime_aware = Joi.date();;
const system_prompt = Joi.string().allow(null);
const task_prompt = Joi.string().allow(null);
const instanceId = Joi.string();

const createPromptSchema = Joi.object({
    name: name.required(),    
    description: description.required(),
    lang: lang.required(),
    shared: shared.required(),
});

const updatePromptSchema = Joi.object({
    id: id.required(),
    name: name.required(),    
    description: description.required(),
    lang: lang.required(),
    shared: shared.required(),
    include_citacions: include_citacions,
    datetime_aware: datetime_aware,
    system_prompt: system_prompt,
    task_prompt: task_prompt,
});

const getPromptSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createPromptSchema, updatePromptSchema, getPromptSchema }