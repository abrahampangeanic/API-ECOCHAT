const { config } = require('./../config/config');
const env = process.env.NODE_ENV || 'development'; // Determina el entorno (desarrollo o producción)
const dbConfig = config[env];

module.exports = {
  development: {
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    host:  dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
  },
  production: {
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    host:  dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        //rejectUnauthorized: false
      }
    }
  }
}
