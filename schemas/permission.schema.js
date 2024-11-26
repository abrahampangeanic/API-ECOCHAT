const Joi = require('joi');

const id = Joi.string();
const name = Joi.string();
const skill = Joi.string();
const resource = Joi.string();
const accessMode = Joi.string();
const groupId = Joi.string();
const collectionId = Joi.string().allow("");
const assistantId = Joi.string().allow("");
const instanceId = Joi.string();

const createPermissionSchema = Joi.object({
  name: name.required(),
  skill: skill.required(),    
  resource: resource.required(),  
  accessMode: accessMode.required(),
  groupId: groupId.required(),
  collectionId: collectionId,
  assistantId: assistantId,
});

const updatePermissionSchema = Joi.object({
    id: id.required(),
    name: name.required(),
    skill: skill.required(),    
    resource: resource.required(),
    accessMode: accessMode.required(),
    groupId: groupId.required(),
    collectionId: collectionId,
    assistantId: assistantId,
});

const getPermissionSchema = Joi.object({
  instanceId: instanceId.required(),
  id: id.required(),
});

module.exports = { createPermissionSchema, updatePermissionSchema, getPermissionSchema }