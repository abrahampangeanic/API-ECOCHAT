const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const { models } = require('../libs/sequelize');  
const NotificationService = require('./notification.service');
const notification = new NotificationService();

class CustomerService {

  async create(data) {

    const user = await models.User.findOne({ where: { 'email': data.user.email }});
    if (user)   throw boom.conflict('User already exists');
    
    const hash = await bcrypt.hash(data.user.password, 10);
    const newData = {
      ...data,
      language: "es",
      user: {
        ...data.user,
        password: hash,
        role: 'Business'
      }
    }
    const newCustomer = await models.Customer.create(newData, {
      include: ['user']
    });
    delete newCustomer.dataValues.user.dataValues.password;

    await notification.sendRegister(data.user.email);

    return newCustomer;
  }

  async find() {
    const rta = await models.Customer.findAll({
      include: ['user']
    });
    return rta;
  }

  async findOne(id) {
    const user = await models.Customer.findOne({
      where: {  'userId': id}
    });

    if (!user)  throw boom.notFound('customer not found');
    
    return user;
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
    await models.EnterpriseUser.destroy({ where: { 'userId': id }})
    return { rta: true };
  }

}

module.exports = CustomerService;


// "users": [
//   {
//       "id": 1,
//       "email": "admin@mail.com",
//       "role": "super",
//       "EnterpriseUser": {
//           "permissions": "Advisor",
//       }
//   },
// ]