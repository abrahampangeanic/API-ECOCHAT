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
      where: {  'instanceId': instanceId },
      include: [ 'sources' ],
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

  async update(changes) {
    const model = await this.findOne(changes.id);
    if (!model)   throw boom.notFound('collection not found');
    if (model.instanceId !== changes.instanceId) throw boom.unauthorized('collection not authorized');
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id) {
    const model = await this.findOne(id);
    if (!model)   throw boom.notFound('collection not found');
    await models.CollectionSource.destroy({ where: { collectionId: id } });
    await model.destroy();
    return { rta: true };
  }

}

module.exports = CollectionService;