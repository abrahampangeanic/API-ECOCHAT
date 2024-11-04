const { Model, DataTypes, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); 

const PERMISSION_TABLE = 'permissions';

const PermissionSchema = {
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
  skill: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resource:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  accessMode: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  groupId: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  collectionId: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  assistantId: {
    allowNull: true,
    type: DataTypes.INTEGER,
  },
  instanceId: {
    allowNull: true,
    type: DataTypes.INTEGER,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
}

class Permission extends Model {

  static associate(models) {
    this.belongsTo(models.Group, {  as: 'group'});
  }
  
  static config(sequelize) {
    return {
      sequelize,
      tableName: PERMISSION_TABLE,
      modelName: 'Permission',
      timestamps: false
    }
  }
}

module.exports = { Permission, PermissionSchema, PERMISSION_TABLE };
