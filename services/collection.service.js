const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class CollectionService {

  constructor(){}

  async create(data) {
    const collection = await models.Collection.create(data);
    return collection;
  }

  async findByInstance(instanceId) {
    const collection = await models.Collection.findAll({
      where: {  '$instanceId$': instanceId  }
    });

    return { collections: [...collection] };
  }

  async findByInstanceAndId(instanceId, id) {
    const collection = await models.Collection.findOne({
      where: {  '$instanceId$': instanceId, '$id$': id  }
    });

    return { collections: [...collection] };
  }

  async find() {
    const collection = await models.Collection.findAll({
        order: [
            ['id', 'ASC']
          ]
    });
    
    return { collections: [...collection] };
  }

  async findOne(id) {
    const collection = await models.Collection.findByPk(id );
    if (!collection)  throw boom.notFound('collection not found');
    return collection;
  }

  async update(instanceId, changes) {
    const model = await this.findByInstanceAndId(instanceId, changes.id);
    if (!model)   throw boom.notFound('collection not found');
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id) {
    const model = await this.findByEnterprise(id);
    if (!model)   throw boom.notFound('collection not found');
    await model.destroy();
    return { rta: true };
  }

}

module.exports = CollectionService;