const { v4: uuidv4 } = require('uuid');
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');  
const { Op, Sequelize } = require("sequelize");

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

  async CountbyInstance(instanceId) {
    const year = 2024;

    const results = await models.Query.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("created_At")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total"],
      ],
      where: {
        instanceId: instanceId,
        createdAt: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lt]: new Date(`${year + 1}-01-01`),
        },
      },
      group: [Sequelize.fn("MONTH", Sequelize.col("created_At"))],
      order: [[Sequelize.fn("MONTH", Sequelize.col("created_At")), "ASC"]],
    });
    
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => (0));

    // Combina los resultados de la consulta en el array de 12 meses
    results.forEach(result => {
      const monthIndex = result.dataValues.month - 1; // Ajusta el índice para el array (de 1 a 12)
      monthlyTotals[monthIndex] = result.dataValues.total;
    });

    return monthlyTotals;
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