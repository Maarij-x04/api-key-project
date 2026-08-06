const usageModel = require('./usage.model');

const WINDOW_SECONDS = 60;

// Must run AFTER apiKey.middleware.js's validateApiKey (needs req.apiKey)
async function rateLimit(req, res, next) {
  const apiKey = req.apiKey;
  const limit = apiKey.rate_limit || 60;

  const requestCount = await usageModel.countRequestsInWindow(apiKey.id, WINDOW_SECONDS);

  if (requestCount >= limit) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      limit,
      windowSeconds: WINDOW_SECONDS,
    });
  }

  next();
}

module.exports = { rateLimit };