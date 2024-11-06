const { Model, DataTypes, Sequelize } = require('sequelize');

const PROMPT_TABLE = 'prompts';

const PromptSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shared: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  include_citacions:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  datetime_aware:{
    type: DataTypes.DATE,
    allowNull: true,
  },
  system_prompt:{
    type: DataTypes.TEXT,
    allowNull: true,
  },
  task_prompt:{
    type: DataTypes.TEXT,
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
