const { v4: uuidv4 } = require('uuid');
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');  

class CollectionSourceService {

  async create(data) {
    const newCollectionSource = await  models.CollectionSource.create(data);
    return newCollectionSource;
  }

  async find() {
    const collectionSource = await models.CollectionSource.findAll();
    return collectionSource;
  }

  async findOne(id) {
    const session = await models.CollectionSource.findByPk(id);
    if (!session)  throw boom.notFound('CollectionSource not found');
    return session;
  }

  async update( changes) {
    const model = await this.findOne(changes.id);
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id) {
    const model = await this.findOne(id);
    await model.destroy();
    return { rta: true };
  }

}

module.exports = CollectionSourceService;