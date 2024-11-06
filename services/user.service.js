const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { models } = require('../libs/sequelize');

class UserService {
  constructor() {}

  async create(data) {

    const user = await models.User.findOne({ where: { 'email': data.email }});
    if (user)   throw boom.conflict('User already exists');

    const hash = await bcrypt.hash(data.password, 10);

    const newData = {
      email: data.email,
      password: hash,
      role: 'client',
      profile: {
        name: data.name,
        lastName: data.lastName,
        language: data.language
      },
      instanceUsers: {
        role: data.role,
        instanceId: data.instanceId
      },
      apikey:{
        key: uuidv4()
      }
    }

    const newUser = await models.User.create(newData, {include: ['profile','instanceUsers', 'apikey']});
    delete newUser.dataValues.password;
    return newUser;
  }

  async find() {
    const rta = await models.User.findAll({
      include: ['profile']
    });
    return rta;
  }

  
  async findByInstance(id) {
    const rta = await models.Instance.findByPk(id, {
      include: [{ 
        model: models.User, 
        as: 'users' , 
        where: { role: { [Op.ne]: 'super' } },
        include: ['profile', 'groups']
      }]
    });

    if (!rta)   return { users: [] }; // Retorna un array vacío si no se encuentra la instancia
    
    const instanceData = rta.toJSON();
    const users = instanceData.users || [];
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    return { users: usersWithoutPasswords };
  }

  async findByEmail(email) {
    const rta = await models.User.findOne({
      where: { email },
      include: [ 'apikey']
    });
    return rta;
  }

  async findByStripeCustomer(id) {
    const rta = await models.User.findOne({
      where: { "stripeCustomerId": id }
    });
    return rta;
  }

  async findOne(id) {
    const user = await models.User.findByPk(id, {
      include: ['profile', 'instances', 'apikey']
    });

    if (!user)  throw boom.notFound('user not found');
    
    return user;
  }

  async findOneBasic(id) {
    const user = await models.User.findByPk(id, {
      include: ['profile']
    });
    if (!user) throw boom.notFound('user not found');
    return user;
  }

  async update(id, changes) {
    const user = await this.findOneBasic(id);
    const rta = await user.update(changes);
    return rta;
  }

  async delete(id) {
    const user = await this.findOneBasic(id);
    await user.destroy();
    return { id };
  }
}

module.exports = UserService;
