const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure Supabase Auth API',
      version: '1.0.0',
      description:
        'A simple, secure CRUD API using Supabase Auth for login/logout/JWTs and Supabase Postgres (anon key + RLS only, no service_role key) for data.',
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
