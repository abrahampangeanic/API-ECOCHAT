const { Model, DataTypes, Sequelize } = require('sequelize');

const ASSISTANTCOLLECTION_TABLE = 'assistant_collection';

const AssistantCollectionSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  assistantId: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  collectionId: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  accessMode: {
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


class AssistantCollection extends Model {

  static associate(models) {
    this.belongsTo(models.Assistant, { as: 'assistant' });
    this.belongsTo(models.Collection, { as: 'collection' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ASSISTANTCOLLECTION_TABLE,
      modelName: 'AssistantCollection',
      timestamps: false
    }
  }
}

module.exports = { AssistantCollection, AssistantCollectionSchema, ASSISTANTCOLLECTION_TABLE };
