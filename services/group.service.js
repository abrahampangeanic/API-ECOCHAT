const { v4: uuidv4 } = require('uuid');
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');  

class GroupService {

  async create(data) {
    const newGroup = await  models.Group.create(data);
    return newGroup;
  }

  async find() {
    const collectionSource = await models.Group.findAll();
    return collectionSource;
  }

  
  async findByInstance(instanceId) {
    const collection = await models.Group.findAll({
      where: {  'instanceId': instanceId },
      include: [ 'permissions' ],
    });

    return { groups: [...collection] };
  }

  async findOne(id) {
    const session = await models.Group.findByPk(id);
    if (!session)  throw boom.notFound('Group not found');
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

module.exports = GroupService;