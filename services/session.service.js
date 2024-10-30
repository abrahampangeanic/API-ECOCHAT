const { v4: uuidv4 } = require('uuid');
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');  

class SessionService {

  async create(data) {
    const newSession = await  models.Session.create(data);
    return newSession;
  }

  async find() {
    const sessions = await models.Session.findAll();
    return sessions;
  }

  async findOne(id) {
    const session = await models.Session.findByPk(id);
    if (!session)  throw boom.notFound('Session not found');
    return session;
  }

  async findByUser(userId) {
    const sessions = await models.Session.findOne({
      where: { 'userId': userId }
    });

    if (!sessions)  throw boom.notFound('customer not found');
    
    return sessions;
  }

  async update( changes) {
    const model = await this.findOne(changes.id);
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id) {
    const model = await this.findOne(id);
    const change = { removed: 1}
    await model.update(change);
    return { rta: true };
  }

}

module.exports = SessionService;