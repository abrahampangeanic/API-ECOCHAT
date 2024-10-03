const Joi = require('joi');

const id = Joi.number().integer();
const year = Joi.number().integer();
const typeId = Joi.number().integer();


const sourceId = Joi.number().integer();
const state = Joi.number().integer();

// const createDocumentSchema = Joi.object({
//   hashcode: hashcode.required(),
//   url: url.required(),
//   newname: newname.required(),
//   oldname: oldname.required(),
//   sourceId: sourceId.required(),
// });

const updateDocumentSchema = Joi.object({
  id: id,
  state: state,
});

const getDocumentSchema = Joi.object({
  sourceId: sourceId.required(),
  year: year.required(),
  id: id.required(),
});

const createDocumentSchema = Joi.object({
  sourceId: sourceId.required(),
  year: year.required(),
  typeId: typeId.required(),
});

module.exports = { createDocumentSchema, updateDocumentSchema, getDocumentSchema }
