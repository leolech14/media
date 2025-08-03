const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory
const logsDir = path.join(__dirname, '../../logs');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} [${service}] ${level}: ${message} ${metaString}`;
    })
);

// Define transports
const transports = [
    // Console transport - colorized for development
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    })
];

// Add file transports only in production
if (process.env.NODE_ENV === 'production') {
    transports.push(
        // Daily rotate file for all logs
        new DailyRotateFile({
            filename: path.join(logsDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'info'
        }),
        // Daily rotate file for errors only
        new DailyRotateFile({
            filename: path.join(logsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error'
        })
    );
}

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'video-creator-ai' },
    transports,
    exitOnError: false
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
    write: function(message) {
        logger.info(message.trim());
    }
};

// Helper functions for structured logging
const logApiRequest = (req, metadata = {}) => {
    logger.info('API Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        ...metadata
    });
};

const logApiResponse = (req, res, metadata = {}) => {
    const duration = Date.now() - req.startTime;
    logger.info('API Response', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ...metadata
    });
};

const logExternalApiCall = (service, endpoint, metadata = {}) => {
    logger.info('External API Call', {
        service,
        endpoint,
        timestamp: new Date().toISOString(),
        ...metadata
    });
};

const logExternalApiResponse = (service, endpoint, statusCode, duration, metadata = {}) => {
    logger.info('External API Response', {
        service,
        endpoint,
        statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        ...metadata
    });
};

const logError = (error, req = null, metadata = {}) => {
    const errorInfo = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
        ...metadata
    };

    if (req) {
        errorInfo.request = {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('user-agent')
        };
    }

    logger.error('Error occurred', errorInfo);
};

module.exports = {
    logger,
    logApiRequest,
    logApiResponse,
    logExternalApiCall,
    logExternalApiResponse,
    logError
};