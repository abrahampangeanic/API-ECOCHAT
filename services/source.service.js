const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class SourceService {

  constructor(){}

  async create(data) {
    const assistant = await models.Source.create(data);
    return assistant;
  }

  async findByInstance(instanceId) {
    const assistant = await models.Source.findAll({
      where: {  '$instanceId$': instanceId  },
      include: [ 'documents' ],
    });

    return assistant;
  }

  async findByInstanceAndId(instanceId, id) {
    const assistant = await models.Source.findOne({
      where: {  '$instanceId$': instanceId, '$id$': id  }
    });

    return assistant;
  }

  async find() {
    const assistant = await models.Source.findAll({
        order: [
            ['id', 'ASC']
          ]
    });
    return assistant;
  }

  async findOne(id) {
    const assistant = await models.Source.findByPk(id );
    if (!assistant)  throw boom.notFound('assistant not found');
    return assistant;
  }

  async update(instanceId, changes) {
    const model = await this.findByInstanceAndId(instanceId, changes.id);
    if (!model)   throw boom.notFound('assistant not found');
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id) {
    const model = await this.findByEnterprise(id);
    if (!model)   throw boom.notFound('assistant not found');
    await model.destroy();
    return { rta: true };
  }

}

module.exports = SourceService;