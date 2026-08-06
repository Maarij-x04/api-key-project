const usageModel = require('./usage.model');

// Must run AFTER validateApiKey. Logs once the response actually finishes,
// so the real status code and duration are captured.
function logUsage(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    if (!req.apiKey) return;

    usageModel
      .logUsage({
        apiKeyId: req.apiKey.id,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        responseTimeMs: Date.now() - startTime,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      })
      .catch((err) => console.error('Failed to log API usage:', err.message));
  });

  next();
}

module.exports = { logUsage };