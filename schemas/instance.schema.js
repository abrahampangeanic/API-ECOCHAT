const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const client_name = Joi.string();
const baseUrl = Joi.string();
const description = Joi.string();
const type = Joi.string();
const lang = Joi.string();
const logo = Joi.string().allow(null);

const instanceId = Joi.number().integer();

const createInstanceSchema = Joi.object({
    name: name.required(),    
    client_name: client_name.required(),
    baseUrl: baseUrl,
    description: description.required(),
    type: type.required(),
    lang: lang.required(),
    logo: logo || '',
});

const updateInstanceSchema = Joi.object({
    id: id.required(),
    name: name.required(),    
    client_name: client_name.required(),
    baseUrl: baseUrl,
    description: description.required(),
    type: type.required(),
    lang: lang.required(),
    logo: logo || '',
});

const getInstanceSchema = Joi.object({
  instanceId: instanceId.required(),
});

module.exports = { createInstanceSchema, updateInstanceSchema, getInstanceSchema }