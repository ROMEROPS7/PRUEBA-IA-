const crypto = require('crypto');
const cache = new Map();

function etagCache(ttlSeconds = 60) {
  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of cache) {
      if (now - val.timestamp > ttlSeconds * 1000) cache.delete(key);
    }
  }, ttlSeconds * 1000);

  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = req.originalUrl;
    const cached = cache.get(key);

    // Check If-None-Match
    const clientEtag = req.headers['if-none-match'];
    if (cached && clientEtag === cached.etag && (Date.now() - cached.timestamp < ttlSeconds * 1000)) {
      return res.status(304).end();
    }

    // Intercept response to generate ETag
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      const body = JSON.stringify(data);
      const etag = '"' + crypto.createHash('md5').update(body).digest('hex').slice(0, 16) + '"';
      cache.set(key, { etag, timestamp: Date.now() });
      res.set('ETag', etag);
      res.set('Cache-Control', `public, max-age=${ttlSeconds}`);
      return originalJson(data);
    };
    next();
  };
}

module.exports = { etagCache };
