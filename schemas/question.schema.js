const Joi = require('joi');

const question = Joi.string();
const assistantId = Joi.string();
const sessionId = Joi.string();
const content = Joi.string();
const role = Joi.string();
const skill = Joi.string();

const createQuestionSchema = Joi.object({
  assistantId: assistantId.required(),
  question: question.required(),
  sessionId: sessionId.required(),
  skill: skill,
  history: Joi.array().items(
    Joi.object({
      content: content.required(),
      role: role.required().valid('assistant', 'user'),
    })
  ),
});

module.exports = { createQuestionSchema };
