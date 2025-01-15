const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class SourceService {

  constructor(){}

  async create(data) {
    const source = await models.Source.create(data);
    return source;
  }

  async findByInstance(instanceId) {
    const source = await models.Source.findAll({
      where: {  '$instanceId$': instanceId  },
      include: [ 'documents' ],
      order: [
        ['createdAt', 'ASC']
      ]
    });

    return { sources: [...source] };
  }

  async findByInstanceAndId(instanceId, id) {
    const source = await models.Source.findOne({
      where: {  '$instanceId$': instanceId, '$id$': id  }
    });

    return { sources: [...source] };
  }

  async find() {
    const source = await models.Source.findAll({
        order: [
            ['id', 'ASC']
          ]
    });
    return { sources: [...source] };
  }

  async findAllWithInstance() {
    const source = await models.Source.findAll({
        include: [ 'instance' ],
        order: [
            ['id', 'ASC']
          ]
    });
    return { sources: [...source] };
  }

  async findOne(id) {
    const source = await models.Source.findByPk(id );
    if (!source)  throw boom.notFound('source not found');
    return source;
  }

  async update( changes) {
    const model = await this.findOne(changes.id);
    if (!model)   throw boom.notFound('source not found');
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id) {
    const model = await this.findOne(id);
    if (!model)   throw boom.notFound('source not found');
    await model.destroy();
    return { rta: true };
  }

}

module.exports = SourceService;