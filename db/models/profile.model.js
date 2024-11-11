const { Model, DataTypes, Sequelize } = require('sequelize');

const PROFILE_TABLE = 'profiles';

const ProfileSchema =  {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  lastName: {
    allowNull: false,
    type: DataTypes.STRING,
    field: 'last_name',
  },
  phone: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  language:{
    allowNull: false,
    type: DataTypes.STRING,
    field: 'language',
  },
  userId: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  removed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    default: 0
  },
}

class Profile extends Model {

  static associate(models) {
    this.belongsTo(models.User, {as: 'user'});
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: PROFILE_TABLE,
      modelName: 'Profile',
      timestamps: false
    }
  }
}

module.exports = { Profile, ProfileSchema, PROFILE_TABLE };
