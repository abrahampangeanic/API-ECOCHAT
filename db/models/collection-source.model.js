const { Model, DataTypes, Sequelize } = require('sequelize');

const COLLECTIONSOURCE_TABLE = 'collection_source';

const CollectionSourceSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  collectionId: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  sourceId: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  }
}


class CollectionSource extends Model {

  static associate(models) {
    this.belongsTo(models.Collection, { as: 'collections' });
    this.belongsTo(models.Source, { as: 'sources' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: COLLECTIONSOURCE_TABLE,
      modelName: 'CollectionSource',
      timestamps: false
    }
  }
}

module.exports = { CollectionSource, CollectionSourceSchema, COLLECTIONSOURCE_TABLE };
