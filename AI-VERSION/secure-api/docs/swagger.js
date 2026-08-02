const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure Supabase API',
      version: '1.0.0',
      description:
        'A simple, secure CRUD API with JWT authentication (register/login/logout) built on Express and Supabase (Postgres).',
    },
    servers: [
      {
        url: '/',
        description: 'Current server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
