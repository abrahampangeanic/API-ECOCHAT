const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string().min(3).max(30);
const lastName = Joi.string();
// const phone = Joi.string();
const userId = Joi.string();
const email = Joi.string().email();
const password = Joi.string();
const role = Joi.string();
const language = Joi.string();

const getProfileSchema = Joi.object({
  id: id.required(),
});

const createProfileSchema = Joi.object({
  name: name.required(),
  lastName: lastName.required(),
  //  phone: phone.required(),
  language: language.required(),
  user: Joi.object({
    email: email.required(),
    password: password.required(),
    role: role,
  }),
});

const updateProfileSchema = Joi.object({
  userId: userId.required(),
  name: name.required(),
  lastName: lastName.required(),
});

module.exports = { getProfileSchema, createProfileSchema, updateProfileSchema };
