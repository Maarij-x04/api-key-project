const buckets = new Map(); // apiKeyId -> { tokens, lastRefillTimestamp }

// 1. Prevent Memory Leak: Clean up inactive buckets every 10 minutes
const BUCKET_TTL_MS = 10 * 60 * 1000; 

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefillTimestamp > BUCKET_TTL_MS) {
      buckets.delete(key);
    }
  }
}, BUCKET_TTL_MS).unref(); // .unref() ensures this timer won't prevent process exit

function checkRateLimit(bucket, now, capacity, refillRatePerSecond) {
  const elapsedSeconds = (now - bucket.lastRefillTimestamp) / 1000;
  const refillAmount = elapsedSeconds * refillRatePerSecond;

  bucket.tokens = Math.min(capacity, bucket.tokens + refillAmount);
  bucket.lastRefillTimestamp = now;

  if (bucket.tokens < 1) {
    // Calculate seconds needed until at least 1 full token is available
    const missingTokens = 1 - bucket.tokens;
    const secondsToWait = Math.ceil(missingTokens / refillRatePerSecond);
    
    return { allowed: false, remaining: 0, retryAfter: secondsToWait };
  }

  bucket.tokens -= 1;
  return { 
    allowed: true, 
    remaining: Math.floor(bucket.tokens), 
    retryAfter: 0 
  };
}

function rateLimit(req, res, next) {
  const apiKey = req.apiKey;
  const capacity = apiKey.rate_limit || 60; 
  const refillRatePerSecond = capacity / 60; 

  const now = Date.now();
  let bucket = buckets.get(apiKey.id);

  if (!bucket) {
    bucket = { tokens: capacity, lastRefillTimestamp: now };
    buckets.set(apiKey.id, bucket);
  }

  const { allowed, remaining, retryAfter } = checkRateLimit(
    bucket, 
    now, 
    capacity, 
    refillRatePerSecond
  );

  // 2. Set informative HTTP headers
  res.setHeader('X-RateLimit-Limit', capacity);
  res.setHeader('X-RateLimit-Remaining', remaining);

  if (!allowed) {
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${retryAfter} second(s).`,
      retryAfterSeconds: retryAfter
    });
  }

  next();
}

module.exports = { rateLimit };