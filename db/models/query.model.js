const { Model, DataTypes, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); 

const QUERY_TABLE = 'querys';

const QuerySchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    defaultValue: uuidv4,
    type: DataTypes.UUID,  
  },
  message_in: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  message_out: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  feedback_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refs: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ts_in: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ts_out: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tokens_in: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tokens_out: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  task_prompt: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  skill: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sessionId: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  assistantId: {
    allowNull: false,
    type: DataTypes.STRING,
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

class Query extends Model {
  static associate(models) {
    this.belongsTo(models.Session, {  as: 'session'});

  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: QUERY_TABLE,
      modelName: 'Query',
      timestamps: false
    }
  }
}

module.exports = { Query, QuerySchema, QUERY_TABLE };
