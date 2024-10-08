const { Model, DataTypes, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); 

const SOURCE_TABLE = 'sources';

const SourceSchema = {
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
  sourcetype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reference: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  web_connector_type:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  pages:{
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  indextsreq:{
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  indextsend:{
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  enabled:{
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  indexstatus: {
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  instanceId: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
}

class Source extends Model {

  static associate(models) {
    this.belongsTo(models.Instance, {  as: 'instance'});
    this.hasMany(models.Document, { as: 'documents',  foreignKey: 'sourceId' });
    this.hasMany(models.CollectionSource, { as: 'relation',  foreignKey: 'sourceId' });
    this.belongsToMany(models.Collection, {
      as: 'collections',
      through: models.CollectionSource,
      foreignKey: 'sourceId',
      otherKey: 'collectionId'
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: SOURCE_TABLE,
      modelName: 'Source',
      timestamps: false
    }
  }
}

module.exports = { Source, SourceSchema, SOURCE_TABLE };
