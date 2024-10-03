const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const description = Joi.string();
const access_type = Joi.string();
const instanceId = Joi.number().integer();

const createCollectionSchema = Joi.object({
    name: name.required(),    
    description: description.required(),
});

const updateCollectionSchema = Joi.object({
    id: id.required(),
    name: name.required(),    
    description: description.required(),
});

const getCollectionSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createCollectionSchema, updateCollectionSchema, getCollectionSchema }