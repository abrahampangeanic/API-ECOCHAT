const { Sequelize } = require('sequelize');

const { config } = require('../config/config');
const setupModels = require('../db/models');

const env = process.env.NODE_ENV || 'development'; // Determina el entorno (desarrollo o producción)
const dbConfig = config[env];



const options = {
  dialect: 'mysql',
  logging: false,
}

if (config.isProd) {
  options.dialectOptions = {
    ssl: {
      rejectUnauthorized: false
    }
  }
}

// const sequelize = new Sequelize(config.dbUrl, options);

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool // Aquí está el pool de conexiones
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Connection with DB has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

setupModels(sequelize);

module.exports = {
  sequelize,
  models: sequelize.models
};