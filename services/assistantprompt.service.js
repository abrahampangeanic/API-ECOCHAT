const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');  

class AssistantPromptService {

  async create(data) {
    const newAssistantPrompt = await  models.AssistantPrompt.create(data);
    return newAssistantPrompt;
  }

  async find() {
    const collectionSource = await models.AssistantPrompt.findAll();
    return collectionSource;
  }

  async findOne(id) {
    const session = await models.AssistantPrompt.findByPk(id);
    if (!session)  throw boom.notFound('AssistantPrompt not found');
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

module.exports = AssistantPromptService;