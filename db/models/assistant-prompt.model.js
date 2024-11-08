const { Model, DataTypes, Sequelize } = require('sequelize');

const ASSISTANTPROMPT_TABLE = 'assistant_prompt';

const AssistantPromptSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  assistantId: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  promptId: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  }
}


class AssistantPrompt extends Model {

  static associate(models) {
    this.belongsTo(models.Assistant, { as: 'assistant' });
    this.belongsTo(models.Prompt, { as: 'prompt' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ASSISTANTPROMPT_TABLE,
      modelName: 'AssistantPrompt',
      timestamps: false
    }
  }
}

module.exports = { AssistantPrompt, AssistantPromptSchema, ASSISTANTPROMPT_TABLE };
