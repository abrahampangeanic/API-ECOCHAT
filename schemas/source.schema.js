const Joi = require('joi');

const id = Joi.number().integer();
const name = Joi.string();
const description = Joi.string();
const sourcetype = Joi.string();
const reference = Joi.string();
const web_connector_type = Joi.string();
const pages = Joi.number().integer();
const indextsreq = Joi.number().integer();
const indextsend = Joi.number().integer();
const enabled = Joi.number().integer();
const indexstatus = Joi.number().integer();
const instanceId = Joi.number().integer();
const files = Joi.object({
  file: Joi.object({
    originalname: Joi.string().required(),  // nombre original del archivo
    mimetype: Joi.string().valid('image/jpeg', 'image/png', 'application/pdf').required(),  // tipos permitidos
    size: Joi.number().max(5 * 1024 * 1024).required()  // tamaño máximo permitido (5MB en este caso)
  })
});

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
  // files: files.required(),
});

const updateSourceSchema = Joi.object({
    id: id.required(),
    name: name.required(),    
    description: description.required(),
    sourcetype: sourcetype.required(),
    reference: reference.required(),
    web_connector_type: web_connector_type.required(),
    pages: pages,
    indextsreq: indextsreq,
    indextsend: indextsend,
    enabled: enabled,
    indexstatus: indexstatus, 
});

const getSourceSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createSourceSchema, updateSourceSchema, getSourceSchema, createSourceFileSchema }