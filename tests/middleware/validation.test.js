const { validationResult } = require('express-validator');
const {
    validateGenerateScript,
    validateGenerateAudio,
    validateSearchMedia,
    validateGenerateSubtitles
} = require('../../src/middleware/validation');

// Mock express request and response
const mockRequest = (body = {}, query = {}) => ({
    body,
    query
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe('Validation Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateGenerateScript', () => {
        it('should pass valid prompt', async () => {
            const req = mockRequest({ prompt: 'This is a valid prompt for testing' });
            const res = mockResponse();
            
            for (const middleware of validateGenerateScript.slice(0, -1)) {
                await middleware(req, res, mockNext);
            }
            
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should reject empty prompt', async () => {
            const req = mockRequest({ prompt: '' });
            const res = mockResponse();
            
            for (const middleware of validateGenerateScript.slice(0, -1)) {
                await middleware(req, res, mockNext);
            }
            
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Prompt is required');
        });

        it('should reject prompt that is too short', async () => {
            const req = mockRequest({ prompt: 'short' });
            const res = mockResponse();
            
            for (const middleware of validateGenerateScript.slice(0, -1)) {
                await middleware(req, res, mockNext);
            }
            
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array()[0].msg).toBe('Prompt must be between 10 and 500 characters');
        });
    });

    describe('validateGenerateAudio', () => {
        it('should pass valid audio segments', async () => {
            const req = mockRequest({
                segments: [
                    { text: 'First segment', duration: 3 },
                    { text: 'Second segment', duration: 4 }
                ],
                voiceName: 'pt-BR-FranciscaNeural'
            });
            const res = mockResponse();
            
            for (const middleware of validateGenerateAudio.slice(0, -1)) {
                await middleware(req, res, mockNext);
            }
            
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should reject invalid voice name', async () => {
            const req = mockRequest({
                segments: [{ text: 'Test segment' }],
                voiceName: 'invalid-voice'
            });
            const res = mockResponse();
            
            for (const middleware of validateGenerateAudio.slice(0, -1)) {
                await middleware(req, res, mockNext);
            }
            
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(e => e.msg === 'Invalid voice name')).toBe(true);
        });
    });

    describe('validateSearchMedia', () => {
        it('should pass valid search query', async () => {
            const req = mockRequest({}, { 
                query: 'nature videos',
                type: 'video',
                count: '10'
            });
            const res = mockResponse();
            
            for (const middleware of validateSearchMedia.slice(0, -1)) {
                await middleware(req, res, mockNext);
            }
            
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should reject invalid media type', async () => {
            const req = mockRequest({}, { 
                query: 'test',
                type: 'invalid-type'
            });
            const res = mockResponse();
            
            for (const middleware of validateSearchMedia.slice(0, -1)) {
                await middleware(req, res, mockNext);
            }
            
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(e => e.msg === 'Type must be video, image, or gif')).toBe(true);
        });
    });

    describe('validateGenerateSubtitles', () => {
        it('should pass valid subtitle segments', async () => {
            const req = mockRequest({
                segments: [
                    { text: 'First subtitle', startTime: 0, endTime: 3 },
                    { text: 'Second subtitle', startTime: 3, endTime: 6 }
                ]
            });
            const res = mockResponse();
            
            for (const middleware of validateGenerateSubtitles.slice(0, -1)) {
                await middleware(req, res, mockNext);
            }
            
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(true);
        });

        it('should reject when endTime is before startTime', async () => {
            const req = mockRequest({
                segments: [
                    { text: 'Invalid timing', startTime: 5, endTime: 3 }
                ]
            });
            const res = mockResponse();
            
            for (const middleware of validateGenerateSubtitles.slice(0, -1)) {
                await middleware(req, res, mockNext);
            }
            
            const errors = validationResult(req);
            expect(errors.isEmpty()).toBe(false);
            expect(errors.array().some(e => e.msg === 'End time must be greater than start time')).toBe(true);
        });
    });
});