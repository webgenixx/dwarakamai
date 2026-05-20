const cacheStore = new Map();

const buildKey = (req) => req.originalUrl || req.url;

export const cacheMiddleware = (ttlSeconds = 60) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = buildKey(req);
    const now = Date.now();
    const cached = cacheStore.get(key);

    if (cached && cached.expiresAt > now) {
      return res.json(cached.payload);
    }

    const originalJson = res.json.bind(res);

    res.json = (body) => {
      cacheStore.set(key, {
        payload: body,
        expiresAt: now + ttlSeconds * 1000,
      });
      return originalJson(body);
    };

    return next();
  };
};

export const invalidateCache = (predicate = () => true) => {
  for (const key of cacheStore.keys()) {
    if (predicate(key)) {
      cacheStore.delete(key);
    }
  }
};

