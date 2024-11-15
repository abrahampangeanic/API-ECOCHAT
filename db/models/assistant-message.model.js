const { Model, DataTypes, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); 
const ASSISTANTMESSAGE_TABLE = 'assistant_messages';

const AssistantMessageSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    defaultValue: uuidv4,
    type: DataTypes.UUID,  
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lang:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  assistantId: {
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

class AssistantMessage extends Model {

  static associate(models) {
    this.belongsTo(models.Assistant, {  as: 'assistant'});
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ASSISTANTMESSAGE_TABLE,
      modelName: 'AssistantMessage',
      timestamps: false
    }
  }
}

module.exports = { AssistantMessage, AssistantMessageSchema, ASSISTANTMESSAGE_TABLE };
