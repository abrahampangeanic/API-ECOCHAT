const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const { models } = require('../libs/sequelize');
const ApiKeyService = require('./apikey.service');
const apikeyService = new ApiKeyService();

const NotificationService = require('./notification.service');
const notification = new NotificationService();

class ProfileService {

  async create(data) {

    const user = await models.User.findOne({ where: { 'email': data.user.email }});
    if (user)   throw boom.conflict('User already exists');
    
    const hash = await bcrypt.hash(data.user.password, 10);
    const newData = {
      ...data,
      user: {
        ...data.user,
        password: hash,
        role: 'Business'
      }
    }
    const newProfile = await models.Profile.create(newData, {
      include: ['user']
    });

    await apikeyService.create({userId: newProfile.userId , expiresAt: null });

    delete newProfile.dataValues.user.dataValues.password;
    return newProfile;
  }

  async find() {
    const rta = await models.Profile.findAll({
      include: ['user']
    });
    return rta;
  }

  async findOne(id) {
    const user = await models.Profile.findOne({
      where: {  'userId': id}
    });

    if (!user)  throw boom.notFound('profile not found');
    
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

module.exports = ProfileService;


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