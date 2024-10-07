const Joi = require('joi');

const id = Joi.string();
const status = Joi.string();
const modules = Joi.string();

const updateStatusDocumentSchema = Joi.object({
  id: id,
  module: modules,
  status: status,
});

const getDocumentSchema = Joi.object({
  documentId: id.required(),
});


module.exports = {  updateStatusDocumentSchema, getDocumentSchema }
