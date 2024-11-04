const { Model, DataTypes, Sequelize } = require('sequelize');

const USERGROUP_TABLE = 'user_group';

const UserGroupSchema = {
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
  groupId: {
    field: 'group_id',
    allowNull: false,
    type: DataTypes.STRING,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  }
}


class UserGroup extends Model {

  static associate(models) {
    this.belongsTo(models.User, { as: 'user' });
    this.belongsTo(models.Group, { as: 'group' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: USERGROUP_TABLE,
      modelName: 'UserGroup',
      timestamps: false
    }
  }
}

module.exports = { UserGroup, UserGroupSchema, USERGROUP_TABLE };
