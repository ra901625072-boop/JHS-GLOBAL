import cacheService from '../services/cache.service.js';

export const cacheResponse = (ttlSeconds = 300) => async (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = `http:${req.originalUrl || req.url}`;
  const cachedData = await cacheService.get(cacheKey);

  if (cachedData) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cachedData);
  }

  res.setHeader('X-Cache', 'MISS');
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success) {
      cacheService.set(cacheKey, body, ttlSeconds).catch(() => {});
    }
    return originalJson(body);
  };

  next();
};

export default cacheResponse;
