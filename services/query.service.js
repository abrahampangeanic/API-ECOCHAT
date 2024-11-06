const { v4: uuidv4 } = require('uuid');
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');  

class QueryService {

  async create(data) {
    const newQuery = await  models.Query.create(data);
    return newQuery;
  }

  async find() {
    const query = await models.Query.findAll();
    return query;
  }

  async findOne(id) {
    const query = await models.Query.findByPk(id);
    if (!query)  throw boom.notFound('Query not found');
    return query;
  }

  async findByUser(userId) {
    const query = await models.Query.findOne({
      where: { 'userId': userId }
    });

    if (!query)  throw boom.notFound('Query not found');
    
    return query;
  }

  
  async findBySession(sessionId) {
    const rta = await models.Query.findAll({
      where: { 'sessionId': sessionId }
    });

    if (!rta || rta.length === 0) return { queries: [] };

    const queryData = rta.map(query => query.toJSON());
    const queriesBasic = queryData.map(({ refs, ts_in, ts_out, tokens_in, tokens_out, task_prompt, ...query }) => query);
  
    return { queries: queriesBasic };
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

module.exports = QueryService;