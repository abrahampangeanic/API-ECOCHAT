const Joi = require('joi');

const question = Joi.string();
const assistantId = Joi.string();
const sessionId = Joi.string();

const createQuestionSchema = Joi.object({
    assistantId	: assistantId.required(),
    question: question.required(),    
    sessionId: sessionId.required(),
});


module.exports = { createQuestionSchema}