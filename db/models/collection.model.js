const { Model, DataTypes, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid'); 

const COLLECTION_TABLE = 'collections';

const CollectionSchema = {
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
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
  instanceId: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  openai_id: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
}

class Collection extends Model {

  static associate(models) {
    this.belongsTo(models.Instance, {  as: 'instance'});
    this.hasMany(models.AssistantCollection, { as: 'relationAssistant',  foreignKey: 'collectionId' });
    this.belongsToMany(models.Assistant, {
      as: 'assistants',
      through: models.AssistantCollection,
      foreignKey: 'collectionId',
      otherKey: 'assistantId'
    });

    // this.hasMany(models.CollectionSource, { as: 'relationSource',  foreignKey: 'collectionId' });
    this.belongsToMany(models.Source, {
      as: 'sources',
      through: models.CollectionSource,
      foreignKey: 'collectionId',
      otherKey: 'sourceId'
    });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: COLLECTION_TABLE,
      modelName: 'Collection',
      timestamps: false
    }
  }
}

module.exports = { Collection, CollectionSchema, COLLECTION_TABLE };
