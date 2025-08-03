const { logApiRequest, logApiResponse } = require('../utils/logger');

// Request timing middleware
const requestTimer = (req, res, next) => {
    req.startTime = Date.now();
    
    // Log request
    logApiRequest(req);
    
    // Log response when finished
    res.on('finish', () => {
        logApiResponse(req, res);
    });
    
    next();
};

// Performance monitoring
const performanceMonitor = (req, res, next) => {
    const start = process.hrtime();
    
    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        
        // Log slow requests (> 3 seconds)
        if (duration > 3000) {
            req.logger.warn('Slow request detected', {
                url: req.url,
                method: req.method,
                duration: `${duration.toFixed(2)}ms`
            });
        }
    });
    
    next();
};

// Health metrics collector
class HealthMetrics {
    constructor() {
        this.requests = {
            total: 0,
            success: 0,
            error: 0,
            byEndpoint: {}
        };
        this.startTime = Date.now();
    }
    
    recordRequest(endpoint, statusCode) {
        this.requests.total++;
        
        if (statusCode >= 200 && statusCode < 400) {
            this.requests.success++;
        } else {
            this.requests.error++;
        }
        
        if (!this.requests.byEndpoint[endpoint]) {
            this.requests.byEndpoint[endpoint] = {
                total: 0,
                success: 0,
                error: 0
            };
        }
        
        this.requests.byEndpoint[endpoint].total++;
        if (statusCode >= 200 && statusCode < 400) {
            this.requests.byEndpoint[endpoint].success++;
        } else {
            this.requests.byEndpoint[endpoint].error++;
        }
    }
    
    getMetrics() {
        const uptime = Date.now() - this.startTime;
        const successRate = this.requests.total > 0 
            ? (this.requests.success / this.requests.total * 100).toFixed(2)
            : 100;
            
        return {
            uptime: `${Math.floor(uptime / 1000)}s`,
            requests: this.requests,
            successRate: `${successRate}%`,
            timestamp: new Date().toISOString()
        };
    }
}

const healthMetrics = new HealthMetrics();

// Metrics collection middleware
const metricsCollector = (req, res, next) => {
    res.on('finish', () => {
        healthMetrics.recordRequest(req.path, res.statusCode);
    });
    next();
};

module.exports = {
    requestTimer,
    performanceMonitor,
    metricsCollector,
    healthMetrics
};