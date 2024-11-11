const { Model, DataTypes, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); 

const PROMPT_TABLE = 'prompts';

const PromptSchema = {
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
  prompt:{
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  skill: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shared: {
    type: DataTypes.INTEGER,
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

class Prompt extends Model {

  static associate(models) {
    this.belongsTo(models.Instance, {  as: 'instance'});
    this.hasMany(models.AssistantPrompt, { as: 'relation',  foreignKey: 'promptId' });
    this.belongsToMany(models.Assistant, {
      as: 'assistants',
      through: models.AssistantPrompt,
      foreignKey: 'promptId',
      otherKey: 'assistantId'
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PROMPT_TABLE,
      modelName: 'Prompt',
      timestamps: false
    }
  }
}

module.exports = { Prompt, PromptSchema, PROMPT_TABLE };
