const { Model, DataTypes, Sequelize } = require('sequelize');

const DOCUMENT_TABLE = 'documents';

const DocumentSchema =  {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  url: {
    allowNull: false,
    type: DataTypes.STRING,
    field: 'url',
  },
  newname: {
    allowNull: true,
    type: DataTypes.STRING,
    field: 'new_name',
  },
  oldname: {
    allowNull: true,
    type: DataTypes.STRING,
    field: 'old_name',
  },
  state: {
    allowNull: true,
    type: DataTypes.STRING,
    field: 'state',
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: Sequelize.NOW,
  },
  sourceId: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
}

class Document extends Model {

  static associate(models) {
    this.belongsTo(models.Source, {  as: 'source'});
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: DOCUMENT_TABLE,
      modelName: 'Document',
      timestamps: false
    }
  }
}

module.exports = { Document, DocumentSchema, DOCUMENT_TABLE };
