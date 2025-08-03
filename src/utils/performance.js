const crypto = require('crypto');

// Generate cache key from request parameters
function generateCacheKey(prefix, params) {
    const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
            if (params[key] !== undefined && params[key] !== null) {
                acc[key] = params[key];
            }
            return acc;
        }, {});
    
    const paramString = JSON.stringify(sortedParams);
    const hash = crypto.createHash('md5').update(paramString).digest('hex');
    
    return `${prefix}:${hash}`;
}

// Async parallel processing helper
async function processInParallel(items, processor, concurrency = 5) {
    const results = [];
    const executing = [];
    
    for (const item of items) {
        const promise = Promise.resolve().then(() => processor(item));
        results.push(promise);
        
        if (items.length >= concurrency) {
            executing.push(promise);
            
            if (executing.length >= concurrency) {
                await Promise.race(executing);
                executing.splice(executing.findIndex(p => p === promise), 1);
            }
        }
    }
    
    return Promise.all(results);
}

// Batch processing for API calls
class BatchProcessor {
    constructor(processFn, batchSize = 10, delay = 100) {
        this.processFn = processFn;
        this.batchSize = batchSize;
        this.delay = delay;
        this.queue = [];
        this.processing = false;
    }
    
    async add(item) {
        return new Promise((resolve, reject) => {
            this.queue.push({ item, resolve, reject });
            this.process();
        });
    }
    
    async process() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.batchSize);
            
            try {
                const results = await this.processFn(batch.map(b => b.item));
                
                batch.forEach((item, index) => {
                    item.resolve(results[index]);
                });
            } catch (error) {
                batch.forEach(item => {
                    item.reject(error);
                });
            }
            
            if (this.queue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, this.delay));
            }
        }
        
        this.processing = false;
    }
}

// Memoization decorator
function memoize(fn, ttl = 60000) {
    const cache = new Map();
    
    return async function(...args) {
        const key = JSON.stringify(args);
        const cached = cache.get(key);
        
        if (cached && Date.now() < cached.expiry) {
            return cached.value;
        }
        
        const result = await fn.apply(this, args);
        
        cache.set(key, {
            value: result,
            expiry: Date.now() + ttl
        });
        
        return result;
    };
}

// Response compression helper
function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
        return false;
    }
    
    // Don't compress for small responses
    const contentLength = res.getHeader('Content-Length');
    if (contentLength && parseInt(contentLength) < 1024) {
        return false;
    }
    
    return true;
}

module.exports = {
    generateCacheKey,
    processInParallel,
    BatchProcessor,
    memoize,
    shouldCompress
};