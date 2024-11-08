const { Model, DataTypes, Sequelize } = require('sequelize');

const ASSISTANTSKILL_TABLE = 'assistant_skills';

const AssistantSkillSchema = {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  assistantId: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  skillId: {
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


class AssistantSkill extends Model {

  static associate(models) {
    this.belongsTo(models.Assistant, { as: 'assistant' });
    this.belongsTo(models.Skill, { as: 'skill' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: ASSISTANTSKILL_TABLE,
      modelName: 'AssistantSkill',
      timestamps: false
    }
  }
}

module.exports = { AssistantSkill, AssistantSkillSchema, ASSISTANTSKILL_TABLE };
