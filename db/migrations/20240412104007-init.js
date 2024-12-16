'use strict';

const { USER_TABLE, UserSchema } = require('../models/user.model');
const { PROFILE_TABLE, ProfileSchema } = require('../models/profile.model');
const { INSTANCE_TABLE, InstanceSchema } = require('../models/instance.model');
const { INSTANCEUSER_TABLE, InstanceUserSchema } = require('../models/instance-user.model');
const { DOCUMENT_TABLE, DocumentSchema } = require('../models/document.model');
const { ASSISTANT_TABLE, AssistantSchema } = require('../models/assistant.model');
const { PROMPT_TABLE, PromptSchema } = require('../models/prompt.model');
const { ASSISTANTPROMPT_TABLE, AssistantPromptSchema } = require('../models/assistant-prompt.model');
const { COLLECTION_TABLE, CollectionSchema } = require('../models/collection.model');
const { ASSISTANTCOLLECTION_TABLE, AssistantCollectionSchema } = require('../models/assistant-collection.model');
const { SOURCE_TABLE, SourceSchema } = require('../models/source.model');
const { COLLECTIONSOURCE_TABLE, CollectionSourceSchema } = require('../models/collection-source.model');
const { APIKEY_TABLE, ApiKeySchema } = require('../models/apikey.model');
const { SESSION_TABLE, SessionSchema } = require('../models/session.model');
const { QUERY_TABLE, QuerySchema } = require('../models/query.model');
const { SKILL_TABLE, SkillSchema } = require('../models/skill.model');
const { ASSISTANTSKILL_TABLE, AssistantSkillSchema } = require('../models/assistant-skill.model');
const { USERGROUP_TABLE, UserGroupSchema } = require('../models/user-group.model');
const { GROUP_TABLE, GroupSchema } = require('../models/group.model');
const { PERMISSION_TABLE, PermissionSchema } = require('../models/permisssion.model');
const { ASSISTANTMESSAGE_TABLE, AssistantMessageSchema } = require('../models/assistant-message.model');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable(USER_TABLE, UserSchema);
    await queryInterface.createTable(PROFILE_TABLE, ProfileSchema);
    await queryInterface.createTable(INSTANCE_TABLE, InstanceSchema) ;
    await queryInterface.createTable(INSTANCEUSER_TABLE, InstanceUserSchema) ;
    await queryInterface.createTable(DOCUMENT_TABLE, DocumentSchema) ;
    await queryInterface.createTable(ASSISTANT_TABLE, AssistantSchema) ;
    await queryInterface.createTable(PROMPT_TABLE, PromptSchema) ;
    await queryInterface.createTable(ASSISTANTPROMPT_TABLE, AssistantPromptSchema) ;
    await queryInterface.createTable(COLLECTION_TABLE, CollectionSchema) ;
    await queryInterface.createTable(ASSISTANTCOLLECTION_TABLE, AssistantCollectionSchema) ;
    await queryInterface.createTable(SOURCE_TABLE, SourceSchema) ;
    await queryInterface.createTable(COLLECTIONSOURCE_TABLE, CollectionSourceSchema) ;
    await queryInterface.createTable(APIKEY_TABLE, ApiKeySchema) ;
    await queryInterface.createTable(SESSION_TABLE, SessionSchema) ;
    await queryInterface.createTable(QUERY_TABLE, QuerySchema) ;
    await queryInterface.createTable(SKILL_TABLE, SkillSchema) ;
    await queryInterface.createTable(ASSISTANTSKILL_TABLE, AssistantSkillSchema) ;
    await queryInterface.createTable(USERGROUP_TABLE, UserGroupSchema) ;
    await queryInterface.createTable(GROUP_TABLE, GroupSchema) ;
    await queryInterface.createTable(PERMISSION_TABLE, PermissionSchema) ;
    await queryInterface.createTable(ASSISTANTMESSAGE_TABLE, AssistantMessageSchema) ;

    await queryInterface.bulkInsert('users', [
      {
        id: '2c91ac93-0f3c-4dbd-8b0d-4d682153cc2e', 
        email: 'abraham@pangeanic.com',
        password: '$2a$10$XufU.6H2sjEoZK3kcr2EPuuFRd6jh3p9O3m4bYspEREz9bZws4/4i',
        role: 'SUPER',
        create_at: new Date(),
      }
    ]);

    await queryInterface.bulkInsert('profiles', [
      {
        id: "1", 
        name: 'Abraham',
        last_name: 'Armas',
        phone: '+56 987654321',
        language: 'es',
        userId: "2c91ac93-0f3c-4dbd-8b0d-4d682153cc2e",
        removed: 0
      }
    ]);

    await queryInterface.bulkInsert('apikeys', [
      {
        id: 1, 
        key: '2c91ac93-0f3c-4dbd-8b0d-4d682153cc2e',
        userId: "2c91ac93-0f3c-4dbd-8b0d-4d682153cc2e",
        expiresAt: null,
      }
    ]);

    await queryInterface.bulkInsert('skills', [
      {
        id: 1, 
        name: 'Q&A',
        description: 'Question and Answer',
        created_at: new Date(),
      },
      {
        id: 2, 
        name: 'SEARCH',
        description: 'SEARCH',
        created_at: new Date(),
      },
      {
        id: 3, 
        name: 'GENERATION',
        description: 'GENERATION CONTENT',
        created_at: new Date(),
      },
      {
        id: 4, 
        name: 'SUMMARIZATION',
        description: 'SUMMARIZATION CONTENT',
        created_at: new Date(),
      },

    ]);
    
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable(ASSISTANTMESSAGE_TABLE);
    await queryInterface.dropTable(PERMISSION_TABLE);
    await queryInterface.dropTable(GROUP_TABLE);
    await queryInterface.dropTable(USERGROUP_TABLE);
    await queryInterface.dropTable(ASSISTANTSKILL_TABLE);
    await queryInterface.dropTable(SKILL_TABLE);
    await queryInterface.dropTable(QUERY_TABLE);
    await queryInterface.dropTable(SESSION_TABLE);
    await queryInterface.dropTable(APIKEY_TABLE);
    await queryInterface.dropTable(COLLECTION_TABLE);
    await queryInterface.dropTable(ASSISTANTCOLLECTION_TABLE);
    await queryInterface.dropTable(COLLECTIONSOURCE_TABLE);
    await queryInterface.dropTable(SOURCE_TABLE);
    await queryInterface.dropTable(ASSISTANTPROMPT_TABLE);
    await queryInterface.dropTable(PROMPT_TABLE);
    await queryInterface.dropTable(ASSISTANT_TABLE);
    await queryInterface.dropTable(DOCUMENT_TABLE);
    await queryInterface.dropTable(INSTANCEUSER_TABLE);
    await queryInterface.dropTable(INSTANCE_TABLE);
    await queryInterface.dropTable(PROFILE_TABLE);
    await queryInterface.dropTable(USER_TABLE);
  }
};