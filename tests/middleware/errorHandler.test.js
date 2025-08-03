const { ApiError, asyncHandler, errorHandler } = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            url: '/test',
            method: 'GET',
            ip: '127.0.0.1',
            path: '/test',
            get: jest.fn().mockReturnValue('test-user-agent')
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
    });

    describe('ApiError', () => {
        it('should create an error with status code and message', () => {
            const error = new ApiError(404, 'Not found', { resource: 'user' });
            
            expect(error.statusCode).toBe(404);
            expect(error.message).toBe('Not found');
            expect(error.details).toEqual({ resource: 'user' });
            expect(error.isOperational).toBe(true);
        });
    });

    describe('asyncHandler', () => {
        it('should handle successful async function', async () => {
            const asyncFn = jest.fn().mockResolvedValue('success');
            const handler = asyncHandler(asyncFn);
            
            await handler(mockReq, mockRes, mockNext);
            
            expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should catch async errors and pass to next', async () => {
            const error = new Error('Async error');
            const asyncFn = jest.fn().mockRejectedValue(error);
            const handler = asyncHandler(asyncFn);
            
            await handler(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('errorHandler', () => {
        beforeEach(() => {
            // Mock console.error to avoid test output noise
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
            console.error.mockRestore();
        });

        it('should handle ApiError correctly', () => {
            const error = new ApiError(400, 'Bad request', { field: 'email' });
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: {
                    message: 'Bad request',
                    statusCode: 400,
                    details: { field: 'email' },
                    timestamp: expect.any(String),
                    path: '/test'
                }
            });
        });

        it('should handle generic errors with 500 status', () => {
            const error = new Error('Something went wrong');
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: {
                    message: 'Something went wrong',
                    statusCode: 500,
                    details: undefined,
                    timestamp: expect.any(String),
                    path: '/test'
                }
            });
        });

        it('should handle rate limit errors', () => {
            const error = new Error('Rate limit exceeded');
            error.response = { status: 429 };
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(429);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: {
                    message: 'Too many requests to external API',
                    statusCode: 429,
                    details: undefined,
                    timestamp: expect.any(String),
                    path: '/test'
                }
            });
        });

        it('should hide details in production', () => {
            process.env.NODE_ENV = 'production';
            const error = new Error('Internal error with sensitive data');
            
            errorHandler(error, mockReq, mockRes, mockNext);
            
            expect(mockRes.json).toHaveBeenCalledWith({
                error: {
                    message: 'Internal server error',
                    statusCode: 500,
                    details: null,
                    timestamp: expect.any(String),
                    path: '/test'
                }
            });
            
            process.env.NODE_ENV = 'test';
        });
    });
});