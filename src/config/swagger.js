const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Video Creator AI API',
            version: '1.0.0',
            description: 'API para criação de vídeos educativos usando Inteligência Artificial',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://api.videocreator.ai',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'API key for authentication'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' },
                                statusCode: { type: 'number' },
                                details: { type: 'object' },
                                timestamp: { type: 'string', format: 'date-time' },
                                path: { type: 'string' }
                            }
                        }
                    }
                },
                ScriptSegment: {
                    type: 'object',
                    properties: {
                        titulo: { type: 'string' },
                        conteudo: { type: 'string' },
                        duracao: { type: 'number' }
                    }
                },
                AudioSegment: {
                    type: 'object',
                    required: ['text'],
                    properties: {
                        text: { type: 'string' },
                        duration: { type: 'number' }
                    }
                },
                SubtitleSegment: {
                    type: 'object',
                    required: ['text', 'startTime', 'endTime'],
                    properties: {
                        text: { type: 'string' },
                        startTime: { type: 'number' },
                        endTime: { type: 'number' }
                    }
                },
                MediaItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        url: { type: 'string', format: 'uri' },
                        tipo: { type: 'string', enum: ['video', 'imagem', 'gif'] },
                        duracao: { type: 'number' },
                        descricao: { type: 'string' },
                        creditos: { type: 'string' },
                        fonte: { type: 'string', enum: ['pexels', 'giphy', 'unsplash'] }
                    }
                },
                Subtitle: {
                    type: 'object',
                    properties: {
                        text: { type: 'string' },
                        startTime: { type: 'number' },
                        endTime: { type: 'number' }
                    }
                }
            }
        }
    },
    apis: ['./src/server.js', './src/routes/*.js'], // Files containing annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;