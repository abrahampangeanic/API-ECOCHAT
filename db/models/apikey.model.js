const { Model, DataTypes, Sequelize } = require('sequelize');

const APIKEY_TABLE = 'apikeys';

const ApiKeySchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  key: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  userId: {
    allowNull: false,
    unique: true,
    type: DataTypes.STRING
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}

class ApiKey extends Model {
  static associate(models) {
    this.belongsTo(models.User, {as: 'user'});
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: APIKEY_TABLE,
      modelName: 'ApiKey',
      timestamps: false
    }
  }
}


module.exports = { APIKEY_TABLE, ApiKeySchema, ApiKey }
