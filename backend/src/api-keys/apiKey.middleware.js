const apiKeyModel = require('./apiKey.model');
const { hashKey } = require('../common/hash');

async function validateApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  const rawKey = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!rawKey) {
    return res.status(401).json({ error: 'Missing API key. Send it as: Authorization: Bearer <your_key>' });
  }

  const hashed = hashKey(rawKey);
  const apiKey = await apiKeyModel.findByHash(hashed);

  if (!apiKey) return res.status(401).json({ error: 'Invalid API key' });
  if (apiKey.revoked_at) return res.status(401).json({ error: 'This API key has been revoked' });
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return res.status(401).json({ error: 'This API key has expired' });
  }

  req.apiKey = apiKey;
  apiKeyModel.touchLastUsed(apiKey.id).catch((err) => console.error('Failed to update last_used_at:', err.message));

  next();
}

module.exports = { validateApiKey };