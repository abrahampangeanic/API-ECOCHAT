const { Model, DataTypes, Sequelize } = require('sequelize');

const INSTANCEUSER_TABLE = 'instance_user';

const InstanceUserSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  userId: {
    field: 'user_id',
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  instanceId: {
    field: 'instance_id',
    allowNull: false,
    type: DataTypes.STRING,
  },
  role: {
    allowNull: true,
    type: DataTypes.STRING,
    defaultValue: 'USER',
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  }
}


class InstanceUser extends Model {

  static associate(models) {
    this.belongsTo(models.User, { as: 'user' });
    this.belongsTo(models.Instance, { as: 'instance' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: INSTANCEUSER_TABLE,
      modelName: 'InstanceUser',
      timestamps: false
    }
  }
}

module.exports = { InstanceUser, InstanceUserSchema, INSTANCEUSER_TABLE };
