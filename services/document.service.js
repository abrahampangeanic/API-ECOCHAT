const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class DocumentService {


  async create(data) {
    const document = await models.Document.create(data);
    return document;
  }

  async findBySource(sourceId) {
    const document = await models.Document.findAll({
      where: {  '$sourceId$': sourceId  }
    });

    return document;
  }

  async findBySourceIdAndId( id,  sourceId) {
    const document = await models.Document.findOne({
      where: {  '$sourceId$': sourceId, '$id$': id  }
    });

    return document;
  }

  async find() {
    const document = await models.Document.findAll({
        order: [
            ['id', 'ASC']
          ]
    });
    return document;
  }

  async findOne(id) {
    const document = await models.Document.findByPk(id );
    if (!document)  throw boom.notFound('document not found');
    return document;
  }

  async update( changes) {
    const model = await this.findOne(changes.id);
    if (!model)   throw boom.notFound('document not found');
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id) {
    const model = await this.findByEnterprise(id);
    if (!model)   throw boom.notFound('document not found');
    await model.destroy();
    return { rta: true };
  }

}

module.exports = DocumentService;