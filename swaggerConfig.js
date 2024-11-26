const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentación de la API ECOCHAT del proyecto Pangeanic',
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
  },
  apis: ['./index.js', './routes/auth.router.js'],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'https',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    }
  }
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
