const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');  

class AssistantMessageService {

  async create(data) {
    const newAssistantMessage = await  models.AssistantMessage.create(data);
    return newAssistantMessage;
  }

  async find() {
    const messages = await models.AssistantMessage.findAll();
    return messages;
  }

  async findByAssistant(assistantId) {
    const assistant = await models.AssistantMessage.findAll({
      where: {  'assistantId': assistantId  }
    });

    return { assistants: [...assistant] };
  }

  async findOne(id) {
    const message = await models.AssistantMessage.findByPk(id);
    if (!message)  throw boom.notFound('AssistantMessage not found');
    return message;
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

module.exports = AssistantMessageService;