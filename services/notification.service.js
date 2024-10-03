const nodemailer = require('nodemailer');
const { config } = require('../config/config');
const RecoveryTemplate = require('../templateHTML/recovery')
const RegisterTemplate = require('../templateHTML/register')
const PermissionWithPasswordTemplate = require('../templateHTML/newPermissionWithPassword')
const PermissionTemplate = require('../templateHTML/newPermission')

const recovery = new RecoveryTemplate()
const register = new RegisterTemplate()
const permissionWithPassword = new PermissionWithPasswordTemplate()
const permission = new PermissionTemplate()

class NotificationService {

  async sendRecovery(email, link) {
    const mail = {
      from: "Taxrepo<noreply@taxrepo.com>",
      replyTo: "noreply@taxrepo.com",
      to: `${email}`,
      subject: "Email para recuperar contraseña",
      html: recovery.html(link),
    }
    const rta = await this.sendMail(mail);
    return rta;
  }

  async sendRegister(email) {
    const mail = {
      from: "Taxrepo<noreply@taxrepo.com>",
      replyTo: "noreply@taxrepo.com",
      to: `${email}`,
      subject: "Bienvenido a TaxRepo",
      html: register.html(),
    }
    const rta = await this.sendMail(mail);
    return rta;
  }

  async sendPermissionWithPassword(email, password) {
    const mail = {
      from: "Taxrepo<noreply@taxrepo.com>",
      replyTo: "noreply@taxrepo.com",
      to: `${email}`,
      subject: "Bienvenido a TaxRepo",
      html: permissionWithPassword.html(email, password),
    }
    const rta = await this.sendMail(mail);
    return rta;
  }

  async sendPermission(email) {
    const mail = {
      from: "Taxrepo<noreply@taxrepo.com>",
      replyTo: "noreply@taxrepo.com",
      to: `${email}`,
      subject: "Bienvenido a TaxRepo",
      html: permission.html(),
    }
    const rta = await this.sendMail(mail);
    return rta;
  }

  async sendMail(infoMail) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      port: 465,
      auth: {
        user: config.smtpEmail,
        pass: config.smtpPassword
      }
    });
    await transporter.sendMail(infoMail);
    return { message: 'mail sent' };
  }
}

module.exports = NotificationService;
