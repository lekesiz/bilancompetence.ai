import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BilanCompetence.AI API',
      version: '1.0.0',
      description:
        'Complete API documentation for BilanCompetence.AI platform. Provides endpoints for user management, assessments, AI-powered career recommendations, scheduling, payments, and more.',
      contact: {
        name: 'BilanCompetence.AI Support Team',
        email: 'support@bilancompetence.ai',
        url: 'https://bilancompetence.ai',
      },
      license: {
        name: 'Proprietary',
        url: 'https://bilancompetence.ai/terms',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://bilancompetence-backend-production.up.railway.app',
        description: 'Production server (Railway)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token. Format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            full_name: {
              type: 'string',
              description: 'User full name',
            },
            role: {
              type: 'string',
              enum: ['BENEFICIAIRE', 'CONSULTANT', 'ADMIN', 'ORG_ADMIN'],
              description: 'User role in the system',
            },
            organization_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Organization ID if user belongs to one',
            },
            cv_url: {
              type: 'string',
              nullable: true,
              description: 'URL to uploaded CV file',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        Assessment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
            },
            assessment_type: {
              type: 'string',
              enum: ['career', 'skills', 'comprehensive'],
            },
            status: {
              type: 'string',
              enum: ['draft', 'in_progress', 'completed', 'archived'],
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            progress: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        JobRecommendation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            title: {
              type: 'string',
              description: 'Job title',
            },
            company: {
              type: 'string',
              description: 'Company name',
            },
            location: {
              type: 'string',
              description: 'Job location',
            },
            contractType: {
              type: 'string',
              description: 'Contract type (CDI, CDD, etc.)',
            },
            salary: {
              type: 'string',
              nullable: true,
              description: 'Salary range',
            },
            matchScore: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Compatibility score with user profile',
            },
            description: {
              type: 'string',
              description: 'Job description',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'string',
              description: 'Detailed error information (development only)',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have permission to access this resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User profile management',
      },
      {
        name: 'Assessments',
        description: 'Skills and career assessments',
      },
      {
        name: 'Recommendations',
        description: 'AI-powered job and career recommendations',
      },
      {
        name: 'Scheduling',
        description: 'Appointment and session scheduling',
      },
      {
        name: 'Payments',
        description: 'Payment and subscription management',
      },
      {
        name: 'Analytics',
        description: 'Platform analytics and reporting',
      },
    ],
  },
  // Path to the API docs
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
