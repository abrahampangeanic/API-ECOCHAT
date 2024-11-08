const Joi = require('joi');

const id = Joi.string();
const feedback = Joi.number();
const feedback_message = Joi.string();
const sessionId = Joi.string();


const updateQuerySchema = Joi.object({
    id: id.required(),
    feedback: feedback,
    feedback_message: feedback_message,
});

const getQuerySchema = Joi.object({
  sessionId: sessionId.required(),
});

module.exports = { updateQuerySchema, getQuerySchema }