const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FeedbackHub API',
      version: '1.0.0',
      description: 'Sistema de Gestão de Feedback Corporativo',
      contact: {
        name: 'FeedbackHub Team',
        email: 'admin@feedbackhub.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://feedbackhub-api.onrender.com/api'
          : 'http://localhost:3001/api',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nome: { type: 'string' },
            email: { type: 'string', format: 'email' },
            papel: { type: 'string', enum: ['COLABORADOR', 'GESTOR', 'ADMINISTRADOR'] },
            equipeId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Feedback: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            titulo: { type: 'string' },
            descricao: { type: 'string' },
            status: { type: 'string', enum: ['PENDENTE', 'EM_ANALISE', 'RESOLVIDO', 'REJEITADO'] },
            autorId: { type: 'string', format: 'uuid' },
            tipoId: { type: 'string', format: 'uuid' },
            pontuacao: { type: 'integer', minimum: 1, maximum: 5 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Team: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nome: { type: 'string' },
            descricao: { type: 'string' },
            gestorId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        FeedbackType: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nome: { type: 'string' },
            descricao: { type: 'string' },
            ativo: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['nome', 'email', 'password'],
          properties: {
            nome: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            papel: { type: 'string', enum: ['COLABORADOR', 'GESTOR', 'ADMINISTRADOR'], default: 'COLABORADOR' },
            equipeId: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        CreateFeedbackRequest: {
          type: 'object',
          required: ['titulo', 'descricao', 'tipoId'],
          properties: {
            titulo: { type: 'string' },
            descricao: { type: 'string' },
            tipoId: { type: 'string', format: 'uuid' },
            pontuacao: { type: 'integer', minimum: 1, maximum: 5 },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
