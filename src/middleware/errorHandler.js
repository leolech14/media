// Custom error class for API errors
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Async error wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Central error handling middleware
const errorHandler = (err, req, res, next) => {
    let { statusCode = 500, message, details } = err;

    // Log error for monitoring
    const { logError } = require('../utils/logger');
    logError(err, req);

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        details = err.errors;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid data format';
    } else if (err.code === 'ECONNREFUSED') {
        statusCode = 503;
        message = 'Service temporarily unavailable';
    } else if (err.response?.status === 429) {
        statusCode = 429;
        message = 'Too many requests to external API';
    } else if (err.response?.status === 401) {
        statusCode = 401;
        message = 'Invalid API credentials';
    }

    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Internal server error';
        details = null;
    }

    res.status(statusCode).json({
        error: {
            message,
            statusCode,
            details,
            timestamp: new Date().toISOString(),
            path: req.path
        }
    });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

// Timeout handler
const timeoutHandler = (timeout = 30000) => {
    return (req, res, next) => {
        const timeoutId = setTimeout(() => {
            const error = new ApiError(408, 'Request timeout');
            next(error);
        }, timeout);

        res.on('finish', () => {
            clearTimeout(timeoutId);
        });

        next();
    };
};

module.exports = {
    ApiError,
    asyncHandler,
    errorHandler,
    notFoundHandler,
    timeoutHandler
};