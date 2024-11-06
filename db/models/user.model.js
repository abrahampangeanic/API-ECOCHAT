const { Model, DataTypes, Sequelize } = require('sequelize');


const USER_TABLE = 'users';

const UserSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  email: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  password: {
    allowNull: false,
    type: DataTypes.STRING
  },
  recoveryToken: {
    field: 'recovery_token',
    allowNull: true,
    type: DataTypes.STRING
  },
  role: {
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: 'CUSTOMER'
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'create_at',
    defaultValue: Sequelize.NOW
  }
}

class User extends Model {
  static associate(models) {
    this.hasOne(models.Profile, { as: 'profile',  foreignKey: 'userId' });
    this.hasMany(models.Session, { as: 'sessions',  foreignKey: 'userId' });
    this.hasOne(models.ApiKey, { as: 'apikey',  foreignKey: 'userId' });
    this.hasMany(models.InstanceUser, { as: 'instanceUsers',  foreignKey: 'userId' });
    this.belongsToMany(models.Instance, {
      as: 'instances',
      through: models.InstanceUser,
      foreignKey: 'userId',
      otherKey: 'instanceId'
    });
    this.belongsToMany(models.Group, {
      as: 'groups',
      through: models.UserGroup,
      foreignKey: 'userId',
      otherKey: 'groupId'
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: USER_TABLE,
      modelName: 'User',
      timestamps: false
    }
  }
}


module.exports = { USER_TABLE, UserSchema, User }
