const { Model, DataTypes, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); 

const SESSION_TABLE = 'sessions';

const SessionSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    defaultValue: uuidv4,
    type: DataTypes.UUID,  
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assistantId: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  userId: {
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

class Session extends Model {
  static associate(models) {
    this.belongsTo(models.Assistant, {  as: 'assistant'});
    this.belongsTo(models.User, {  as: 'user'});
    this.hasMany(models.Query, { as: 'query',  foreignKey: 'sessionId' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: SESSION_TABLE,
      modelName: 'Session',
      timestamps: false
    }
  }
}

module.exports = { Session, SessionSchema, SESSION_TABLE };
