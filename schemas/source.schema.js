const Joi = require('joi');

const id = Joi.string();
const name = Joi.string();
const description = Joi.string();
const sourcetype = Joi.string();
const reference = Joi.string().allow(null, '');
const web_connector_type = Joi.string().allow(null, '');
const pages = Joi.number().integer();
const indextsreq = Joi.number().integer();
const indextsend = Joi.number().integer();
const enabled = Joi.number().integer();
const indexstatus = Joi.number().integer();
const instanceId = Joi.string();
const publicationDate = Joi.date();
const owner = Joi.string();
const fingerprint = Joi.string();
const keyword = Joi.string();
const tokens = Joi.number().integer();
const chunks = Joi.number().integer();
const vector_size = Joi.number().integer();
const indexing_time = Joi.number();
const language = Joi.string();

const files = Joi.object({
  file: Joi.object({
    originalname: Joi.string().required(),  // nombre original del archivo
    mimetype: Joi.string().valid('image/jpeg', 'image/png', 'application/pdf').required(),  // tipos permitidos
    size: Joi.number().max(50 * 1024 * 1024).required()  // tamaño máximo permitido (5MB en este caso)
  })
});
const status = Joi.string();
const processor = Joi.string();
const message = Joi.string().allow(null, '');

const createSourceSchema = Joi.object({
  name: name.required(),
  description: description.required(),
  sourcetype: sourcetype.required(),
  reference: reference.required(),
  web_connector_type: web_connector_type.required(),
});

const createSourceFileSchema = Joi.object({
  name: name.required(),
  description: description.required(),
  publicationDate: publicationDate,
  owner: owner,
  fingerprint: fingerprint,
  keyword: keyword,
  // files: files.required(),
});

const updateSourceSchema = Joi.object({
  id: id.required(),
  name: name.required(),
  description: description.required(),
  sourcetype: sourcetype.required(),
  reference: reference.required(),
  web_connector_type: web_connector_type.required(),
  indexstatus: indexstatus,
  pages: pages,
  indextsreq: indextsreq,
  indextsend: indextsend,
  enabled: enabled,
  publicationDate: publicationDate,
  owner: owner,
  fingerprint: fingerprint,
  keyword: keyword,
});

const getSourceSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

const getSourceIdSchema = Joi.object({
  id: id.required(),
});

const updateStatusSourceSchema = Joi.object({
  id: id,
  processor: processor,
  status: status,
  pages: pages,
  message: message,
  tokens: tokens,
  chunks: chunks,
  vector_size: vector_size,
  indexing_time: indexing_time,
  language: language,
});

// STATUS CODE 1 INDEX SUCCESS
// STATUS CODE 2 INPROGRESS 
// STATUS CODE 3 INDEX FAILED
// STATUS CODE UNDEFINE ALL 
const getSourceStatusIndex = Joi.object({
  status: Joi.number().valid(1, 2, 3).optional().empty(''),
});

module.exports = { createSourceSchema, updateSourceSchema, getSourceSchema, getSourceIdSchema, updateStatusSourceSchema, createSourceFileSchema, getSourceStatusIndex }