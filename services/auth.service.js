const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const nodemailer = require('nodemailer');
const { config } = require('../config/config');
const UserService = require('./user.service');
const NotificationService = require('./notification.service');

const service = new UserService();
const notification = new NotificationService();
const { models } = require('../libs/sequelize');

class AuthService {

  async getUser(email, password) {
    const user = await service.findByEmail(email);
    if (!user) {
      throw boom.unauthorized();
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw boom.unauthorized();;
    }
    delete user.dataValues.password;
    return user;
  }

  async verify_token(api_token) {
    let decode;
    try { 
      decode = jwt.verify(api_token, config.jwtSecret);
    } catch(error){ 
      throw boom.unauthorized();
    }

    if (!decode || !decode.sub)   throw boom.unauthorized();
    
    const user = await service.findOne(decode.sub);
    if (!user) throw boom.unauthorized();
    delete user.dataValues.password;
    //console.log(user.dataValues);
    return  user.dataValues ;
  }

  signToken(user) {
    const payload = {
      sub: user.id,
      role: user.role
    }
    const api_token = jwt.sign(payload, config.jwtSecret);
    return {
      ...user.dataValues,
      api_token
    };
  }

  async sendRecovery(email) {
    const user = await service.findByEmail(email);
    if (!user) {
      throw boom.unauthorized();
    }
    const payload = { sub: user.id };
    const token = jwt.sign(payload, config.jwtSecret, {expiresIn: '15min'});
    const link = `https://app.taxrepo.com/auth/recovery?token=${token}`;
    await service.update(user.id, {recoveryToken: token});

    const rta = await notification.sendRecovery(user.email, link);
    return rta;
  }

  async lostPassword(token, newPassword) {
    try {      
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await service.findOne(payload.sub);
      if (user.recoveryToken !== token) {
        throw boom.unauthorized();
      }
      const hash = await bcrypt.hash(newPassword, 10);
      await service.update(user.id, {recoveryToken: null, password: hash});
      return { message: 'password changed' };
    } catch (error) {
      throw boom.unauthorized();
    }
  }

  async changePassword(userId, password, newPassword) {
    try {
      const user = await models.User.findByPk(userId);
      if (!user)  throw boom.unauthorized();
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)  throw boom.unauthorized();;
      
      const hash = await bcrypt.hash(newPassword, 10);
      await service.update(user.id, {recoveryToken: null, password: hash});
      return { message: 'password changed' };
    } catch (error) {
      throw boom.internal();
    }
  }

  // async sendMail(infoMail) {
  //   const transporter = nodemailer.createTransport({
  //     host: "smtp.gmail.com",
  //     secure: true,
  //     port: 465,
  //     auth: {
  //       user: config.smtpEmail,
  //       pass: config.smtpPassword
  //     }
  //   });
  //   await transporter.sendMail(infoMail);
  //   return { message: 'mail sent' };
  // }
}

module.exports = AuthService;
