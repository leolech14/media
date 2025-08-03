const rateLimit = require('express-rate-limit');

// Create different rate limiters for different endpoints

// General API rate limiter - 100 requests per 15 minutes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict limiter for AI generation endpoints - 20 requests per 15 minutes
const aiGenerationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: 'Too many AI generation requests. Please wait before generating more content.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count all requests, not just errors
});

// Media search limiter - 50 requests per 15 minutes
const mediaSearchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: 'Too many media search requests. Please wait before searching again.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Audio generation limiter - 30 requests per 15 minutes
const audioGenerationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    message: 'Too many audio generation requests. Please wait before generating more audio.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Health check endpoint - No rate limiting
const healthCheckLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Very high limit for health checks
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    aiGenerationLimiter,
    mediaSearchLimiter,
    audioGenerationLimiter,
    healthCheckLimiter
};