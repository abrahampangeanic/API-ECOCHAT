const { User, UserSchema } = require('./user.model');
const { Customer, CustomerSchema } = require('./customer.model');
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

function setupModels(sequelize) {
  User.init(UserSchema, User.config(sequelize));
  Customer.init(CustomerSchema, Customer.config(sequelize));
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

  User.associate(sequelize.models);
  Customer.associate(sequelize.models);
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
}

module.exports = setupModels;
