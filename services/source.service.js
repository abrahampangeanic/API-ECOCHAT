const boom = require('@hapi/boom');
const { models, sequelize } = require('../libs/sequelize');
const {
  Op: { QueryTypes },
} = require('sequelize');

class SourceService {
  constructor() {}

  async create(data) {
    const source = await models.Source.create(data);
    return source;
  }

  async findByInstance(instanceId) {
    const source = await models.Source.findAll({
      where: { $instanceId$: instanceId },
      include: ['documents'],
      order: [['createdAt', 'ASC']],
    });

    return { sources: [...source] };
  }

  async findByInstanceAndId(instanceId, id) {
    const source = await models.Source.findOne({
      where: { $instanceId$: instanceId, $id$: id },
    });

    return { sources: [...source] };
  }

  async find() {
    const source = await models.Source.findAll({
      order: [['id', 'ASC']],
    });
    return { sources: [...source] };
  }

  // STATUS CODE 1 INDEX SUCCESS
  // STATUS CODE 2 INPROGRESS
  // STATUS CODE 3 INDEX FAILED
  // STATUS CODE UNDEFINE ALL
  async findAllByStatus(status) {
    let whereClause = {};
    if (status === 1) whereClause = { indexstatus: 4 };
    else if (status === 2) whereClause = { indexstatus: [0, 1, 2, 3] };
    else if (status === 3) {
      whereClause = { indexstatus: [-1, -2] };
    }

    const source = await models.Source.findAll({
      where: whereClause,
      include: ['instance'],
      order: [['id', 'ASC']],
    });
    return { sources: [...source] };
  }

  async findOne(id) {
    const source = await models.Source.findByPk(id);
    if (!source) throw boom.notFound('source not found');
    return source;
  }

  async update(changes) {
    const model = await this.findOne(changes.id);
    if (!model) throw boom.notFound('source not found');
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id) {
    const relationships = await models.CollectionSource.findAll({
      where: { sourceId: id },
    });
    if (relationships.length > 0) {
      await models.CollectionSource.destroy({ where: { sourceId: id } });
    }
    const documents = await models.Document.findAll({
      where: { sourceId: id },
    });
    if (documents.length > 0) {
      await models.Document.destroy({ where: { sourceId: id } });
    }
    await models.Source.destroy({ where: { id } });
    return { rta: true };
  }

  async findDistinctLanguagesByInstanceId(instanceId) {
    const rows = await sequelize.query(
      `
        SELECT DISTINCT language
        FROM sources
        WHERE instanceId = :instanceId
          AND language IS NOT NULL
      `,
      {
        replacements: { instanceId },
        type: QueryTypes.SELECT,
      }
    );

    const response = rows.map((row) => row.language);

    return response;
  }
}

module.exports = SourceService;
