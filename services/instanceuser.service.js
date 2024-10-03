const boom = require('@hapi/boom');
const { models }= require('../libs/sequelize');
const bcrypt = require('bcrypt');

const UserService = require('./user.service');
const uService = new UserService();

const NotificationService = require('./notification.service');
const notification = new NotificationService();

class InstanceUserService {

  constructor(){}

  async create(data) {      
    const user = await uService.findByEmail(data.email);

    if(data.permissions !== "Advisor") data.permissions = "Client"

    if(user){
      const instanceUser = await  this.findByInstanceUser(data.instanceId, user.id)
      if(instanceUser) throw boom.conflict('relations exist');

      const relation = {
        userId: user.id, 
        instanceId: data.instanceId, 
        permissions: data.permissions
      } 

      const newItem = await models.InstanceUser.create(relation);
      await notification.sendPermission(data.email);

      return newItem;
    }
    else{

      const generateRandomPassword = (length) => {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=';
        let password = '';
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          password += charset[randomIndex];
        }
        return password;
      };

      const newPassword = generateRandomPassword(12)

      const hash = await bcrypt.hash(newPassword, 10);
      const newCustomer = {
        name: data.name,
        lastName: data.lastName,
        phone: "987654321",
        language: 'es',
        user: {
          email: data.email,
          password: hash,
          role:  data.permissions
        }
      }

      const Customer = await models.Customer.create(newCustomer, {
        include: ['user']
      });

      const relation = {
        userId: Customer.userId,
        instanceId: data.instanceId, 
        permissions: data.permissions
      }
  
      const newItem = await models.InstanceUser.create(relation);
      await notification.sendPermissionWithPassword(data.email, newPassword);

      return newItem;
    }
  }

  async find() {
    const categories = await models.InstanceUser.findAll();
    return categories;
  }

  async findByInstanceUser(instanceId, userId) {
    const InstanceUser = await models.InstanceUser.findOne({
      where: {
        'instanceId': instanceId,
        'userId': userId
     }
    });
    return InstanceUser;
  }

  async findByInstance(instanceId) {
    const relations = await models.Instance.findByPk(instanceId, {
      include: ['users']
    });

    if (!relations)   throw boom.notFound('relations not found');


    const result = []
    relations.users.map((item)=> {
      const obj = {
        id: item.InstanceUser.id,
        userId: item.id,
        email: item.email,
        permissions: item.InstanceUser.permissions
      }
      result.push(obj)
    })


    return result;
  }

  async findOne(id) {
    const InstanceUser = await models.InstanceUser.findByPk(id);
    return InstanceUser;
  }

  async update(changes) {
    const model = await this.findOne(changes.id);
    if (model.instanceId != changes.instanceId) throw boom.notAcceptable('not owner');
    const rta = await model.update(changes);
    return rta;
  }

  async delete(id, instanceId) {
    const model = await this.findByInstanceUser(instanceId, id);
    if (model.instanceId != instanceId) throw boom.notAcceptable('not owner');
    await model.destroy();
    return { rta: true };
  }

}

module.exports = InstanceUserService;
