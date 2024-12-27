const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.13',
      description: 'Pangeanic Project ECOCHAT API Documentation',
    },
    servers: [
      {
        url: 'https://api.pangeanic.com/service/ecochat/api/v1', // URL del servidor público
        description: 'Production Server',
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
    './routes/assistantcollection.router.js',
    './routes/assistantmessage.router.js',
    './routes/assistantprompt.router.js',
    './routes/assistantskill.router.js',
    './routes/assistantcollection.router.js',
    './routes/assistantcollectionsource.router.js',
    './routes/collection.router.js',
    './routes/collectionsource.router.js',
    './routes/prompt.router.js',
    './routes/source.router.js',
    './routes/session.router.js',
    './routes/question.router.js',
    './routes/user.router.js',
  ],
};


const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
