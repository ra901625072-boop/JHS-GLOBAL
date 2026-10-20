import logger from '../utils/logger.js';

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = 300) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(keyOrPattern) {
    if (keyOrPattern.includes('*')) {
      const regex = new RegExp(`^${keyOrPattern.replace('*', '.*')}$`);
      for (const key of this.store.keys()) {
        if (regex.test(key)) {
          this.store.delete(key);
        }
      }
    } else {
      this.store.delete(keyOrPattern);
    }
  }

  flush() {
    this.store.clear();
  }
}

const memoryStore = new MemoryCache();

export const cacheService = {
  async get(key) {
    try {
      return memoryStore.get(key);
    } catch (err) {
      logger.warn(`Cache get failed for ${key}: ${err.message}`);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 300) {
    try {
      memoryStore.set(key, value, ttlSeconds);
    } catch (err) {
      logger.warn(`Cache set failed for ${key}: ${err.message}`);
    }
  },

  async del(keyOrPattern) {
    try {
      memoryStore.del(keyOrPattern);
    } catch (err) {
      logger.warn(`Cache del failed for ${keyOrPattern}: ${err.message}`);
    }
  },

  async flush() {
    memoryStore.flush();
  },

  invalidateProducts(slug = null) {
    this.del('http:/api/v1/products*');
    this.del('http:/api/v1/search*');
    this.del('admin:dashboard_metrics');
    if (slug) {
      this.del(`http:/api/v1/products/${slug}*`);
    }
  },

  invalidateCategories() {
    this.del('http:/api/v1/categories*');
    this.del('http:/api/v1/products*');
    this.del('http:/api/v1/search*');
    this.del('admin:dashboard_metrics');
  },

  invalidateFaqs() {
    this.del('http:/api/v1/faqs*');
  },

  invalidateBlog(slug = null) {
    this.del('http:/api/v1/blog*');
    if (slug) {
      this.del(`http:/api/v1/blog/${slug}*`);
    }
  },

  invalidateCertificates() {
    this.del('http:/api/v1/certificates*');
  },
};

export default cacheService;
