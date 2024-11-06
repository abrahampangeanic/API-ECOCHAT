const { Model, DataTypes, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); 

const GROUP_TABLE = 'groups';

const GroupSchema = {
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

class Group extends Model {

  static associate(models) {
    this.belongsTo(models.Instance, {  as: 'instance'});
    this.hasMany(models.Permission, { as: 'permissions',  foreignKey: 'groupId' });
    this.belongsToMany(models.User, {
      as: 'users',
      through: models.UserGroup,
      foreignKey: 'groupId',
      otherKey: 'userId'
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: GROUP_TABLE,
      modelName: 'Group',
      timestamps: false
    }
  }
}

module.exports = { Group, GroupSchema, GROUP_TABLE };
