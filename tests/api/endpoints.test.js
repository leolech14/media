const request = require('supertest');
const express = require('express');

// Mock the external dependencies
jest.mock('openai');
jest.mock('@google-cloud/text-to-speech');
jest.mock('axios');

describe('API Endpoints', () => {
    let app;
    let server;

    beforeAll(() => {
        // Create a minimal express app for testing
        app = express();
        app.use(express.json());
        
        // Add health endpoint
        app.get('/api/health', (req, res) => {
            res.json({ status: 'healthy' });
        });
    });

    afterAll(() => {
        if (server) {
            server.close();
        }
    });

    describe('GET /api/health', () => {
        it('should return healthy status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'healthy');
        });
    });

    describe('POST /api/generate-script', () => {
        it('should validate prompt is required', async () => {
            const response = await request(app)
                .post('/api/generate-script')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should validate prompt length', async () => {
            const response = await request(app)
                .post('/api/generate-script')
                .send({ prompt: 'short' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/search-media', () => {
        it('should validate query parameter', async () => {
            const response = await request(app)
                .get('/api/search-media')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should validate media type', async () => {
            const response = await request(app)
                .get('/api/search-media')
                .query({ query: 'test', type: 'invalid' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/generate-subtitles', () => {
        it('should validate segments array', async () => {
            const response = await request(app)
                .post('/api/generate-subtitles')
                .send({ segments: 'not-an-array' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should validate segment timing', async () => {
            const response = await request(app)
                .post('/api/generate-subtitles')
                .send({
                    segments: [{
                        text: 'Test',
                        startTime: 5,
                        endTime: 3
                    }]
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });
});