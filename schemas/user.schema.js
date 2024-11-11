const Joi = require('joi');

const id = Joi.string();
const email = Joi.string().email();
const password = Joi.string().min(8);
const name = Joi.string();
const lastName = Joi.string()
const language = Joi.string();
const role = Joi.string();

const createUserSchema = Joi.object({
  email: email.required(),
  password: password.required(),
  name: name.required(),
  lastName: lastName.required(),
  language: language.required(),
  role: role.required()
});

const updateUserSchema = Joi.object({
  email: email,
  role: role,
});

const changePasswordSchema = Joi.object({
  oldPassword: password.required(),
  newPassword: password.required(),
});

const getUserSchema = Joi.object({
  id: id.required(),
});

module.exports = { createUserSchema, updateUserSchema, getUserSchema, changePasswordSchema }
