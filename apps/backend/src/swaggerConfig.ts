import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bilan de Compétence API',
      version: '1.0.0',
      description:
        'API Documentation for the Bilan de Compétence backend, providing endpoints for assessments, user management, scheduling, and more.',
      contact: {
        name: 'Support Team',
        email: 'support@bilancompetence.ai',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to the API docs
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
