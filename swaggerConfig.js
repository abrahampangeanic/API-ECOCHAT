const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.21',
      description: 'Pangeanic Project ECOCHAT API Documentation',
    },
    servers: [
      {
        url: 'https://api.pangeanic.com/service/ecochat/api/v1', // URL del servidor público
        description: 'Production Server',
      },
      // {
      //   url: 'http://192.168.100.143:3000/service/ecochat/api/v1', // URL del servidor público
      //   description: 'Production Server',
      // },
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
    './swagger/assistant.swagger.js',
    './swagger/assistantcollection.swagger.js',
    './swagger/assistantmessage.swagger.js',
    './swagger/assistantprompt.swagger.js',
    './swagger/assistantskill.swagger.js',
    './swagger/auth.swagger.js',
    './swagger/collection.swagger.js',
    './swagger/collectionsources.swagger.js',
    './swagger/instance.swagger.js',
    './swagger/question.swagger.js',
    './swagger/session.swagger.js',
    './swagger/source.swagger.js',
  ],
};


const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
