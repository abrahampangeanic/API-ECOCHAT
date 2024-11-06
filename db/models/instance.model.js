const { Model, DataTypes, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); 

const INSTANCE_TABLE = 'instances';

const InstanceSchema = {
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
  client_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  base_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type:{
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lang:{
    type: DataTypes.TEXT,
    allowNull: false,
  },
  controlts:{
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  controlperiod:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  limits:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  counters:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastqueryts:{
    type: DataTypes.DATE,
    allowNull: true,
  },
  usestatus:{
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  prodstatus:{
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  active: {
    field: 'active',
    defaultValue: true,
    allowNull: true,
    type: DataTypes.BOOLEAN
  },
  removed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    default: 0
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
}

class Instance extends Model {

  static associate(models) {
    this.hasMany(models.Assistant, { as: 'assistants',  foreignKey: 'instanceId' });
    this.hasMany(models.Collection, { as: 'collections',  foreignKey: 'instanceId' });
    this.hasMany(models.Source, { as: 'sources',  foreignKey: 'instanceId' });
    this.hasMany(models.Prompt, { as: 'prompts',  foreignKey: 'instanceId' });
    this.hasMany(models.InstanceUser, { as: 'relationUser',  foreignKey: 'instanceId' });
    this.belongsToMany(models.User, {
      as: 'users',
      through: models.InstanceUser,
      foreignKey: 'instanceId',
      otherKey: 'userId'
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: INSTANCE_TABLE,
      modelName: 'Instance',
      timestamps: false
    }
  }
}

module.exports = { Instance, InstanceSchema, INSTANCE_TABLE };
