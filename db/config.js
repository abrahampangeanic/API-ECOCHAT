const { config } = require('./../config/config');

module.exports = {
  development: {
    url: config.dbUrl,
    dialect: 'mysql',
  },
  production: {
    url: config.dbUrl,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        //rejectUnauthorized: false
      }
    }
  }
}
