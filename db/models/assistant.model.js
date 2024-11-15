const { Model, DataTypes, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); 
const ASSISTANT_TABLE = 'assistants';

const AssistantSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    defaultValue: uuidv4,
    type: DataTypes.UUID,  
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  access_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  chunks:{
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  llm_relevance_filter:{
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  llm_filter_extraction:{
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  starter_message:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  poor_answer_message:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  instanceId: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
}

class Assistant extends Model {

  static associate(models) {
    this.belongsTo(models.Instance, {  as: 'instance'});
    this.hasMany(models.Session, { as: 'sessions',  foreignKey: 'assistantId' });
    this.hasMany(models.AssistantMessage, { as: 'messages',  foreignKey: 'assistantId' });
    this.hasMany(models.AssistantCollection, { as: 'relationCollection',  foreignKey: 'assistantId' });

    this.belongsToMany(models.Collection, {
      as: 'collections',
      through: models.AssistantCollection,
      foreignKey: 'assistantId',
      otherKey: 'collectionId'
    });
    
    this.hasMany(models.AssistantPrompt, { as: 'relationPrompt',  foreignKey: 'assistantId' });
    this.belongsToMany(models.Prompt, {
      as: 'prompts',
      through: models.AssistantPrompt,
      foreignKey: 'assistantId',
      otherKey: 'promptId'
    });

    this.belongsToMany(models.Skill, {
      as: 'skills',
      through: models.AssistantSkill,
      foreignKey: 'assistantId',
      otherKey: 'skillId'
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ASSISTANT_TABLE,
      modelName: 'Assistant',
      timestamps: false
    }
  }
}

module.exports = { Assistant, AssistantSchema, ASSISTANT_TABLE };
