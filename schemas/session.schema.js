const Joi = require('joi');

const id = Joi.string();
const name = Joi.string();
const assitantId = Joi.string();

const createSessionSchema = Joi.object({
    name: name.required(),
    assitantId: assitantId.required(),
});

const updateSessionSchema = Joi.object({
    id: id.required(),
    name: name.required(),
});

const getSessionSchema = Joi.object({
  id: id.required(),
});

module.exports = { createSessionSchema, updateSessionSchema, getSessionSchema }