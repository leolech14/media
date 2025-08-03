// Simple in-memory cache implementation
class Cache {
    constructor(ttl = 3600000) { // Default TTL: 1 hour
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value, customTTL = null) {
        const ttl = customTTL || this.ttl;
        const expiry = Date.now() + ttl;
        
        this.cache.set(key, {
            value,
            expiry
        });
    }

    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    has(key) {
        const value = this.get(key);
        return value !== null;
    }

    // Clean up expired entries
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }

    // Get cache stats
    getStats() {
        this.cleanup();
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create cache instances for different purposes
const scriptCache = new Cache(3600000); // 1 hour for scripts
const mediaCache = new Cache(7200000); // 2 hours for media searches
const audioCache = new Cache(86400000); // 24 hours for audio

// Periodic cleanup
setInterval(() => {
    scriptCache.cleanup();
    mediaCache.cleanup();
    audioCache.cleanup();
}, 600000); // Run cleanup every 10 minutes

module.exports = {
    scriptCache,
    mediaCache,
    audioCache,
    Cache
};