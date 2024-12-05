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
    const query = await models.Query.findAll({
      where: { '$userId$': userId }
    });

    if (!query)  throw boom.notFound('Query not found');
    
    return { queries: [...query] };
  }

  async findByInstance(instanceId) {
    const query = await models.Query.findAll({
      where: {  '$instanceId$': instanceId  },
      order: [
        ['created_at', 'DESC']
      ]
    });

    if (!query)  throw boom.notFound('Query not found');
    
    return { queries: [...query] };
  }

  async CountbyInstance(instanceId) {
    const year = new Date().getFullYear(); 

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

  async getCurrentYearTokensSum (instanceId)  {
    try {
      const currentYear = new Date().getFullYear(); // Obtiene el año actual
      const startOfYear = new Date(`${currentYear}-01-01T00:00:00`);
      const endOfYear = new Date(`${currentYear}-12-31T23:59:59`);
  
      const result = await models.Query.findAll({
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('tokens_in')), 'in'],
          [Sequelize.fn('SUM', Sequelize.col('tokens_out')), 'out'],
        ],
        where: {
          instanceId: instanceId,
          createdAt: {
            [Op.between]: [startOfYear, endOfYear], // Filtro para el año en curso
          },
        },
      });
  
      return result[0].dataValues; // Devuelve los resultados de la suma
    } catch (error) {
      console.error('Error al obtener la suma de tokens del año actual:', error);
      throw error;
    }
  };

  async countQueriesByType(instanceId) {
    try {
      const currentYear = new Date().getFullYear(); // Obtiene el año actual
      const startOfYear = new Date(`${currentYear}-01-01T00:00:00`);
      const endOfYear = new Date(`${currentYear}-12-31T23:59:59`);
  
      const results = await models.Query.findAll({
        attributes: [
          [Sequelize.fn('YEAR', Sequelize.col('created_at')), 'year'],
          'skill',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        ],
        where: {
          instanceId: instanceId,
          created_At: {
            [Op.between]: [startOfYear, endOfYear], // Filtro para el año en curso
          },
        },
        group: ['year', 'skill'],
        order: [['skill', 'ASC']],
      });
  
      // Formatear resultados
      let summary = {
        QA: 0,
        SEARCH: 0,
        GENERATION: 0,
        SUMMARIZATION: 0,
        SOCIAL_INTERACTION: 0,
      };
  
      results.forEach(result => {
        let { skill, count } = result.dataValues;
        if (skill === 'Q&A')  skill = "QA"
        summary[skill] = count;
      });
  
      return summary;
    } catch (error) {
      console.error('Error al contar las consultas por tipo:', error);
      throw error;
    }
  }
  
  async findBySession(sessionId) {
    const rta = await models.Query.findAll({
      where: { 'sessionId': sessionId }
    });

    if (!rta || rta.length === 0) return { queries: [] };

    const queryData = rta.map(query => query.toJSON());
    const queriesBasic = queryData.map(({ tokens_in, tokens_out, task_prompt, ...query }) => query);
  
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