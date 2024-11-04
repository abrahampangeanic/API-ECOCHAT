const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class AssistantService {

  constructor(){}

  async create(data) {
    const assistant = await models.Assistant.create(data);
    return assistant;
  }

  async findByInstance(instanceId) {
    const assistant = await models.Assistant.findAll({
      where: {  'instanceId': instanceId  },
      include: [ 'collections', 'skills' ]
    });

    return { assistants: [...assistant] };
  }

  async findByInstanceAndId(instanceId, id) {
    const assistant = await models.Assistant.findOne({
      where: {  '$instanceId$': instanceId, '$id$': id  }
    });

    return { assistants: [...assistant] };
  }

  async find() {
    const assistant = await models.Assistant.findAll({
        order: [
            ['id', 'ASC']
          ]
    });
    return { assistants: [...assistant] };
  }

  async findOne(id) {
    const assistant = await models.Assistant.findByPk(id );
    if (!assistant)  throw boom.notFound('assistant not found');
    return assistant;
  }

  async update(changes) {
    const model = await this.findOne(changes.id);
    if (!model)   throw boom.notFound('assistant not found');
    if (model.instanceId !== changes.instanceId) throw boom.unauthorized('Assitant not authorized');
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

module.exports = AssistantService;