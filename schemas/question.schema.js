const Joi = require('joi');

const question = Joi.string();
const assistantId = Joi.string();
const sessionId = Joi.string();
const message = Joi.string();
const message_type = Joi.string();
const skill = Joi.string();

const createQuestionSchema = Joi.object({
    assistantId	: assistantId.required(),
    question: question.required(),    
    sessionId: sessionId.required(),
    skill: skill,
    history: [
        {
            message: message,
            message_type: message_type
        }
    ]
});


module.exports = { createQuestionSchema}