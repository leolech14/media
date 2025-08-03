const request = require('supertest');
const path = require('path');

// Set up environment before requiring server
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random port for testing

describe('Server Integration Tests', () => {
    let app;
    
    beforeAll(() => {
        // Clear the module cache to ensure fresh server instance
        delete require.cache[require.resolve('../../src/server.js')];
        
        // Mock external services
        jest.mock('openai', () => ({
            default: jest.fn().mockImplementation(() => ({
                chat: {
                    completions: {
                        create: jest.fn().mockResolvedValue({
                            choices: [{
                                message: {
                                    content: JSON.stringify({
                                        titulo: 'Test Video',
                                        introducao: 'Test intro',
                                        segmentos: [
                                            { titulo: 'Segment 1', conteudo: 'Content 1', duracao: 3 },
                                            { titulo: 'Segment 2', conteudo: 'Content 2', duracao: 4 }
                                        ],
                                        conclusao: 'Test conclusion'
                                    })
                                }
                            }]
                        })
                    }
                }
            }))
        }));
        
        jest.mock('@google-cloud/text-to-speech', () => ({
            TextToSpeechClient: jest.fn().mockImplementation(() => ({
                synthesizeSpeech: jest.fn().mockResolvedValue([{
                    audioContent: Buffer.from('fake-audio-data').toString('base64')
                }])
            }))
        }));
        
        jest.mock('axios', () => ({
            get: jest.fn().mockResolvedValue({
                data: {
                    videos: [{ id: 1, url: 'http://example.com/video.mp4' }],
                    data: [{ url: 'http://example.com/image.jpg' }],
                    results: [{ urls: { regular: 'http://example.com/unsplash.jpg' } }]
                }
            }),
            post: jest.fn().mockResolvedValue({
                data: { audioContent: Buffer.from('fake-audio').toString('base64') }
            })
        }));
        
        // Require server after mocks are set up
        app = require('../../src/server.js');
    });

    afterAll((done) => {
        // Close the server
        if (app && app.close) {
            app.close(done);
        } else {
            done();
        }
    });

    describe('GET /api/health', () => {
        it('should return health status with metrics', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('apis');
            expect(response.body).toHaveProperty('metrics');
            expect(response.body.metrics).toHaveProperty('uptime');
            expect(response.body.metrics).toHaveProperty('requests');
        });
    });

    describe('Validation Tests', () => {
        it('should reject invalid prompt for script generation', async () => {
            const response = await request(app)
                .post('/api/generate-script')
                .send({ prompt: '' })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation failed');
            expect(response.body.details).toBeInstanceOf(Array);
        });

        it('should reject invalid media search parameters', async () => {
            const response = await request(app)
                .get('/api/search-media')
                .query({ query: '', type: 'invalid' })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation failed');
        });
    });

    describe('Rate Limiting Tests', () => {
        it('should enforce rate limits on AI generation', async () => {
            // Make multiple requests to trigger rate limit
            const requests = [];
            for (let i = 0; i < 25; i++) {
                requests.push(
                    request(app)
                        .post('/api/generate-script')
                        .send({ prompt: 'Test prompt for rate limiting' })
                );
            }

            const responses = await Promise.all(requests);
            const rateLimited = responses.some(res => res.status === 429);
            
            expect(rateLimited).toBe(true);
        });
    });

    describe('404 Handler', () => {
        it('should return 404 for non-existent routes', async () => {
            const response = await request(app)
                .get('/api/non-existent-endpoint')
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toHaveProperty('message');
            expect(response.body.error.message).toContain('not found');
        });
    });
});