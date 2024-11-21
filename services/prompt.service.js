const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class PromptService {

  constructor(){}

  async create(data) {
    const prompt = await models.Prompt.create(data);
    return prompt;
  }

  async findByInstance(instanceId) {
    const prompt = await models.Prompt.findAll({
      where: {  '$instanceId$': instanceId  }
    });

    return { prompts: [...prompt] };
  }

  async findByInstanceAndId(instanceId, id) {
    const prompt = await models.Prompt.findOne({
      where: {  '$instanceId$': instanceId, '$id$': id  }
    });

    return { prompts: [...prompt] };

  }

  async find() {
    const prompt = await models.Prompt.findAll({
        order: [
            ['id', 'ASC']
          ]
    });
    return { prompts: [...prompt] };

  }

  async findOne(id) {
    const prompt = await models.Prompt.findByPk(id );
    if (!prompt)  throw boom.notFound('prompt not found');
    return prompt;
  }

  async update(changes) {
    const model = await this.findOne( changes.id);
    if (!model)   throw boom.notFound('prompt not found');
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id) {
    const model = await this.findByEnterprise(id);
    if (!model)   throw boom.notFound('prompt not found');
    await model.destroy();
    return { rta: true };
  }

}

module.exports = PromptService;