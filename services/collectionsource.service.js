const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class CollectionSourceService {
  async create(data) {
    const newCollectionSource = await models.CollectionSource.create(data);
    return newCollectionSource;
  }

  async find() {
    const collectionSource = await models.CollectionSource.findAll();
    return collectionSource;
  }

  async findOne(id) {
    const session = await models.CollectionSource.findByPk(id);
    if (!session) throw boom.notFound('CollectionSource not found');
    return session;
  }
  async findAllBySource(sourceId) {
    const collectionSource = await models.CollectionSource.findAll({
      where: { sourceId },
    });
    return collectionSource;
  }

  async findAllByCollection(collectionId) {
    const collectionSource = await models.CollectionSource.findAll({
      where: { collectionId },
    });
    return collectionSource;
  }

  async update(changes) {
    const model = await this.findOne(changes.id);
    const rta = await model.update(changes);
    return rta;
  }

  async deleteByCollection(collectionId) {
    const collectionSource = await models.CollectionSource.destroy({
      where: { collectionId },
    });
    return collectionSource;
  }

  async delete(id) {
    const model = await this.findOne(id);
    if (!model) throw boom.notFound('CollectionSource not found');
    const rta = { collectionId: model.collectionId, sourceId: model.sourceId };
    await model.destroy();
    return rta;
  }
}

module.exports = CollectionSourceService;
