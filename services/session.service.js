// const { v4: uuidv4 } = require('uuid');
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class SessionService {
  async create(data) {
    const newSession = await models.Session.create(data);
    return newSession;
  }

  async find() {
    const sessions = await models.Session.findAll();
    return sessions;
  }

  async findOne(id) {
    const session = await models.Session.findByPk(id);
    if (!session) throw boom.notFound('Session not found');
    return session;
  }

  async findByUser(userId) {
    const sessions = await models.Session.findAll({
      where: { userId: userId },
    });

    if (!sessions) throw boom.notFound('Session not found');

    return sessions;
  }

  async findByAssistant(assistantId) {
    const sessions = await models.Session.findAll({
      where: { assistantId: assistantId },
    });

    if (!sessions) throw boom.notFound('Session not found');

    return sessions;
  }

  async findByUserAssistant(userId, assistantId) {
    const sessions = await models.Session.findAll({
      where: { userId: userId, assistantId: assistantId },
    });

    if (!sessions) throw boom.notFound('Session not found');

    return sessions;
  }

  async update(changes) {
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

module.exports = SessionService;
