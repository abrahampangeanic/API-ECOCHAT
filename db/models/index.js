const { User, UserSchema } = require('./user.model');
const { Profile, ProfileSchema } = require('./profile.model');
const { InstanceUser, InstanceUserSchema } = require('./instance-user.model');
const { Instance, InstanceSchema } = require('./instance.model');
const { Assistant, AssistantSchema } = require('./assistant.model');
const { AssistantPrompt, AssistantPromptSchema } = require('./assistant-prompt.model');
const { Prompt, PromptSchema } = require('./prompt.model');
const { AssistantCollection, AssistantCollectionSchema } = require('./assistant-collection.model');
const { Collection, CollectionSchema } = require('./collection.model');
const { CollectionSource, CollectionSourceSchema } = require('./collection-source.model');
const { Source, SourceSchema } = require('./source.model');
const { Document, DocumentSchema } = require('./document.model');
const { ApiKey, ApiKeySchema } = require('./apikey.model');
const { Session, SessionSchema } = require('./session.model');
const { Query, QuerySchema } = require('./query.model');
const { Skill, SkillSchema } = require('./skill.model');
const { AssistantSkill, AssistantSkillSchema } = require('./assistant-skill.model');

function setupModels(sequelize) {
  User.init(UserSchema, User.config(sequelize));
  Profile.init(ProfileSchema, Profile.config(sequelize));
  InstanceUser.init(InstanceUserSchema, InstanceUser.config(sequelize));
  Instance.init(InstanceSchema, Instance.config(sequelize));
  Assistant.init(AssistantSchema, Assistant.config(sequelize));
  AssistantPrompt.init(AssistantPromptSchema, AssistantPrompt.config(sequelize));
  Prompt.init(PromptSchema, Prompt.config(sequelize));
  AssistantCollection.init(AssistantCollectionSchema, AssistantCollection.config(sequelize));
  Collection.init(CollectionSchema, Collection.config(sequelize));
  CollectionSource.init(CollectionSourceSchema, CollectionSource.config(sequelize));
  Source.init(SourceSchema, Source.config(sequelize));
  Document.init(DocumentSchema, Document.config(sequelize));
  ApiKey.init(ApiKeySchema, ApiKey.config(sequelize));
  Session.init(SessionSchema, Session.config(sequelize));
  Query.init(QuerySchema, Query.config(sequelize));
  Skill.init(SkillSchema, Skill.config(sequelize));
  AssistantSkill.init(AssistantSkillSchema, AssistantSkill.config(sequelize));

  User.associate(sequelize.models);
  Profile.associate(sequelize.models);
  InstanceUser.associate(sequelize.models);
  Instance.associate(sequelize.models);
  Assistant.associate(sequelize.models);
  AssistantPrompt.associate(sequelize.models);
  Prompt.associate(sequelize.models);
  AssistantCollection.associate(sequelize.models);
  Collection.associate(sequelize.models);
  CollectionSource.associate(sequelize.models);
  Source.associate(sequelize.models);
  Document.associate(sequelize.models);
  ApiKey.associate(sequelize.models);
  Session.associate(sequelize.models);
  Query.associate(sequelize.models);
  Skill.associate(sequelize.models);
  AssistantSkill.associate(sequelize.models);
}

module.exports = setupModels;
