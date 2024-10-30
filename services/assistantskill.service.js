const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');  

class AssistantSkillService {

  async create(data) {
    const newAssistantSkill = await  models.AssistantSkill.create(data);
    return newAssistantSkill;
  }

  async find() {
    const collectionSource = await models.AssistantSkill.findAll();
    return collectionSource;
  }

  async findOne(id) {
    const session = await models.AssistantSkill.findByPk(id);
    if (!session)  throw boom.notFound('AssistantSkill not found');
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

module.exports = AssistantSkillService;