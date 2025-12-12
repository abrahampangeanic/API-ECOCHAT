const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class AssistantCollectionService {
  async create(data) {
    const newAssistantCollection = await models.AssistantCollection.create(
      data
    );
    return newAssistantCollection;
  }

  async find() {
    const collectionSource = await models.AssistantCollection.findAll();
    return collectionSource;
  }

  async findOne(id) {
    const session = await models.AssistantCollection.findByPk(id);
    if (!session) throw boom.notFound('AssistantCollection not found');
    return session;
  }

  async update(changes) {
    const model = await this.findOne(changes.id);
    const rta = await model.update(changes);
    return rta;
  }

  async deleteByCollection(collectionId) {
    const assistantCollection = await models.AssistantCollection.destroy({
      where: { collectionId },
    });
    return assistantCollection;
  }

  async deleteByAssistant(assistantId) {
    const assistantCollection = await models.AssistantCollection.destroy({
      where: { assistantId },
    });
    return assistantCollection;
  }

  async delete(id) {
    const model = await this.findOne(id);
    await model.destroy();
    return { rta: true };
  }
}

module.exports = AssistantCollectionService;
