const Joi = require('joi');

const id = Joi.number();
const collectionId = Joi.string();
const sourceId = Joi.string();
const instanceId = Joi.number();

const createCollectionSourceSchema = Joi.object({
    collectionId: collectionId.required(),
    sourceId: sourceId.required(),
});

const updateCollectionSourceSchema = Joi.object({
    id: id.required(),
    collectionId: collectionId.required(),
    sourceId: sourceId.required(),
});

const getCollectionSourceSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createCollectionSourceSchema, updateCollectionSourceSchema, getCollectionSourceSchema }