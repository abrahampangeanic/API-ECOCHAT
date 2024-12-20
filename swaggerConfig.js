const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.12',
      description: 'Pangeanic Project ECOCHAT API Documentation',
    },
    servers: [
      {
        url: 'http://192.168.100.143:3000/service/ecochat/api/v1', // URL base de tu servidor
      },
      {
        url: 'https://api.pangeanic.com/service/ecochat/api/v1', // URL del servidor público
        description: 'Servidor público de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './index.js', 
    './routes/auth.router.js',
    './routes/instance.router.js',
    './routes/assistant.router.js',
    './routes/user.router.js',
  ],
};


const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
