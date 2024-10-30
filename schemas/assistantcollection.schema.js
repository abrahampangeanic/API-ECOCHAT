const Joi = require('joi');

const id = Joi.number();
const assistantId = Joi.number();
const collectionId = Joi.string();
const instanceId = Joi.number();
const accessMode = Joi.string();

const createAssistantCollectionSchema = Joi.object({
    assistantId: assistantId.required(),
    collectionId: collectionId.required(),
    accessMode: accessMode.required(),
});

const updateAssistantCollectionSchema = Joi.object({
    id: id.required(),
    assistantId: assistantId,
    collectionId: collectionId,
    accessMode: accessMode
});

const getAssistantCollectionSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createAssistantCollectionSchema, updateAssistantCollectionSchema, getAssistantCollectionSchema }