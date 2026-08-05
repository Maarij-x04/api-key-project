const pool = require('../database/db');

async function createApiKey({ applicationId, name, keyHash, keyPrefix, scopes, expiresAt, rateLimit }) {
  const result = await pool.query(
    `INSERT INTO api_keys (application_id, name, key_hash, key_prefix, scopes, expires_at, rate_limit)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, application_id, name, key_prefix, scopes, rate_limit, expires_at, revoked_at, created_at`,
    [applicationId, name, keyHash, keyPrefix, scopes || ['read'], expiresAt || null, rateLimit || 60]
  );
  return result.rows[0];
}

async function listByApplication(applicationId) {
  const result = await pool.query(
    `SELECT id, application_id, name, key_prefix, scopes, rate_limit, last_used_at, expires_at, revoked_at, created_at
     FROM api_keys WHERE application_id = $1 ORDER BY created_at DESC`,
    [applicationId]
  );
  return result.rows;
}

// Fetches a key AND confirms it belongs to an application owned by this user —
// this is the ownership check that keeps users from touching each other's keys.
async function findByIdForUser(id, userId) {
  const result = await pool.query(
    `SELECT ak.* FROM api_keys ak
     JOIN applications a ON a.id = ak.application_id
     WHERE ak.id = $1 AND a.user_id = $2`,
    [id, userId]
  );
  return result.rows[0];
}

async function findByHash(keyHash) {
  const result = await pool.query('SELECT * FROM api_keys WHERE key_hash = $1', [keyHash]);
  return result.rows[0];
}

async function updateScopes(id, scopes) {
  const result = await pool.query(
    `UPDATE api_keys SET scopes = $1 WHERE id = $2 RETURNING *`,
    [scopes, id]
  );
  return result.rows[0];
}

async function updateRateLimit(id, rateLimit) {
  const result = await pool.query(
    `UPDATE api_keys SET rate_limit = $1 WHERE id = $2 RETURNING *`,
    [rateLimit, id]
  );
  return result.rows[0];
}

async function revoke(id) {
  const result = await pool.query(
    `UPDATE api_keys SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL RETURNING *`,
    [id]
  );
  return result.rows[0];
}

async function restore(id) {
  const result = await pool.query(
    `UPDATE api_keys SET revoked_at = NULL WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

async function deleteKey(id) {
  const result = await pool.query('DELETE FROM api_keys WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
}

async function touchLastUsed(id) {
  await pool.query('UPDATE api_keys SET last_used_at = now() WHERE id = $1', [id]);
}

module.exports = {
  createApiKey,
  listByApplication,
  findByIdForUser,
  findByHash,
  updateScopes,
  updateRateLimit,
  revoke,
  restore,
  deleteKey,
  touchLastUsed,
};