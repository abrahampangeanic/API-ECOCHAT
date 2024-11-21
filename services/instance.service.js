const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');
const fs = require('fs');
const bcrypt = require('bcrypt');

const UserService = require('./user.service');
const uService = new UserService();

const InstanceUserService = require('./instanceuser.service');
const iuService = new InstanceUserService();

class InstanceService {

  constructor(){}

  async create(data) {
    const newInstance = await models.Instance.create(data);
    
    const relation = {
      userId: data.userId,
      instanceId: newInstance.id,
      role: 'ADMIN'
    }

    await models.InstanceUser.create(relation);

    const directoryPath = `uploads/${newInstance.id}/`;
    if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath, { recursive: true });
    
    return newInstance;
  }

  async checkInstancesByUser(InstanceId, userId) {
    const relationships = await models.InstanceUser.findAll( {
        where: {
          '$user_id$': userId,
          '$Instance_id$': InstanceId,
        },
        order: [['id','ASC']]
    });

    return relationships
  }


  async findByUserBasic(userId) {
    const user = await models.User.findByPk(userId,{
      include: [{ association: 'instances'}]
    });

    if (!user)   throw boom.notFound('Instance not found');
    
    return { instances: [...user.instances] };
  }

  async findByUser(userId) {
    const user = await models.User.findByPk(userId);
    return user.instances;
  }

  async find() {
    const Instances = await models.Instance.findAll({
        // include: [
        //   { association:'address'}, 
        //   { association:'type'}
        // ],
        order: [
            ['id', 'ASC']
          ]
    });
    return Instances;
  }

  async findOne(id) {
    const Instance = await models.Instance.findByPk(id, {
      include: [
        // { association: 'address'}, 
        // { association: 'type'},
        // { association: 'accountings'},
        // { association: 'deadline'},
        // { association: 'balances'},
        { association: 'users'},
      ]
    });

    if (!Instance) {
      throw boom.notFound('Instance not found');
    }

    const relation = []
    Instance.users.map((item)=> {
      const obj = {
        id: item.id,
        email: item.email,
        role: item.InstanceUser.role
      }
      relation.push(obj)
    })

    delete Instance.dataValues.users

    Instance.relations = relation

    return Instance;
  }

  async findOneFULL(id) {
    const Instance = await models.Instance.findByPk(id, {
      include: [
        { association: 'assistants'}, 
        { association: 'collections'},
        { association: 'sources'},
        { association: 'prompts'},
        { association: 'users'},
        // { association: 'relationUser'},
      ]
    });

    if (!Instance) {
      throw boom.notFound('Instance not found');
    }

    const relation = []
    Instance.users.map((item)=> {
      const obj = {
        id: item.id,
        userId: item.userId,
        email: item.email,
        role: item.InstanceUser.role
      }
      relation.push(obj)
    })

    delete Instance.dataValues.users
    const response = {...Instance.toJSON(), relations: relation};

    return response;
  }

  async update(changes) {
    const model = await this.findOne(changes.id);
    //const rta = await model.update(changes, {include: [{ model: Address, as: 'address' }],});
    const rta = await model.update(changes);
    return rta;
  }

  async updateMailClient(changes) {
    // Buscar al usuario
    const user = await uService.findByEmail(changes.mailClient);

    if(user){
      this.addInstanceUser( user.id, changes.id, 'Client');
    }
    else{
      const hash = await bcrypt.hash('5Ur1j9NV:zoK', 10);
      const newData = {
        name: "Buster",
        lastName: "Keaton",
        phone: "987654321",
        language: 'es',
        user: {
          email: changes.mailClient,
          password: hash,
          role: 'Client'
        }
      }

      const newCustomer = await models.Customer.create(newData, {
        include: ['user']
      });

      const relation = {
        userId: newCustomer.id,
        InstanceId: changes.id,
        permissions: 'Client'
      }
  
      await iuService.create(relation);
    }


    const model = await this.findOne(changes.id);
    const rta = await model.update(changes);

    // enviar Correo
    return rta;
  }

  async delete(id) {
    const model = await this.findOne(id);
    if (model.id != id) throw boom.notAcceptable('not owner');
    const change = { removed: 1}
    await model.update(change);
    await models.InstanceUser.destroy({ where: { 'InstanceId': id }})
    return { rta: true };
  }

}

module.exports = InstanceService;
