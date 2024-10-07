const { v4: uuidv4 } = require('uuid');
const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');  

class ApiKeyService {

  async create(data) {
    const apiKey = uuidv4();
    data.key = apiKey;  
    const newApiKey = await  models.ApiKey.create(data);
    return newApiKey;
  }

  async find() {
    const keyRerords = await models.ApiKey.findAll();
    return keyRerords;
  }

  async findOne(id) {
    const keyRerord = await models.ApiKey.findByPk(id);
    if (!keyRerord)  throw boom.notFound('key not found');
    return keyRerord;
  }

  async findByKey(key) {
    const keyRerord = await models.ApiKey.findOne({
      where: { 'key': key},
      include: ['user']
    });

    if (!keyRerord)  throw boom.notFound('customer not found');
    
    return keyRerord;
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

module.exports = ApiKeyService;