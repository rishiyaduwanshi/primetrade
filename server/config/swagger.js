import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './index.js';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PrimeTrade API',
            version: config.VERSION,
            description:
                'REST API with JWT Authentication, Role-Based Access Control and Task CRUD operations.',
            contact: {
                name: 'PrimeTrade',
                email: 'hello@primetrade.ai',
            },
        },
        servers: [
            {
                url: config.APP_URL,
                description: config.NODE_ENV === 'development' ? 'Dev Server' : 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'accessToken',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Task: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        status: { type: 'string', enum: ['todo', 'in-progress', 'done'] },
                        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                        owner: { $ref: '#/components/schemas/User' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        statusCode: { type: 'integer' },
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        statusCode: { type: 'integer' },
                        success: { type: 'boolean', example: false },
                        errors: { type: 'array', items: { type: 'string' } },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Tasks', description: 'Task CRUD endpoints' },
            { name: 'Admin', description: 'Admin-only endpoints' },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
