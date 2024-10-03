const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const description = Joi.string();
const access_type = Joi.string();
const type = Joi.string();
const chunks = Joi.number().integer();
const llm_relevance_filter = Joi.number().integer();
const llm_filter_extraction = Joi.number().integer();
const starter_message = Joi.string().allow(null);
const poor_answer_message = Joi.string().allow(null);
const instanceId = Joi.number().integer();

const createAssistantSchema = Joi.object({
    name: name.required(),    
    description: description.required(),
    type: type.required(),
    access_type: access_type.required(),
});

const updateAssistantSchema = Joi.object({
    id: id.required(),
    name: name.required(),    
    description: description.required(),
    type: type.required(),
    access_type: access_type.required(),
    chunks: chunks,
    llm_relevance_filter: llm_relevance_filter,
    llm_filter_extraction: llm_filter_extraction,
    starter_message: starter_message,
    poor_answer_message: poor_answer_message,
});

const getAssistantSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createAssistantSchema, updateAssistantSchema, getAssistantSchema }