const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.8',
      description: 'Pangeanic Project ECOCHAT API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL base de tu servidor
      },
      {
        url: 'https://api.pangeanic.com/service/ecochat', // URL del servidor público
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
