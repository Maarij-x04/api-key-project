const pool = require('../database/db');

async function logUsage({ apiKeyId, endpoint, method, statusCode, responseTimeMs, ipAddress, userAgent }) {
  await pool.query(
    `INSERT INTO api_usage (api_key_id, endpoint, method, status_code, response_time_ms, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [apiKeyId, endpoint, method, statusCode, responseTimeMs, ipAddress, userAgent]
  );
}

async function countRequestsInWindow(apiKeyId, windowSeconds) {
  const result = await pool.query(
    `SELECT COUNT(*) AS count FROM api_usage
     WHERE api_key_id = $1 AND created_at > now() - ($2 || ' seconds')::interval`,
    [apiKeyId, windowSeconds]
  );
  return parseInt(result.rows[0].count, 10);
}

// GET /usage — filterable across the current user's applications
async function listForUser(userId, { applicationId, status, method, from, to, page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  const conditions = ['a.user_id = $1'];
  const values = [userId];
  let i = 2;

  if (applicationId) {
    conditions.push(`ak.application_id = $${i}`);
    values.push(applicationId);
    i++;
  }
  if (status) {
    conditions.push(`u.status_code = $${i}`);
    values.push(status);
    i++;
  }
  if (method) {
    conditions.push(`u.method = $${i}`);
    values.push(method);
    i++;
  }
  if (from) {
    conditions.push(`u.created_at >= $${i}`);
    values.push(from);
    i++;
  }
  if (to) {
    conditions.push(`u.created_at <= $${i}`);
    values.push(to);
    i++;
  }

  const where = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE ${where}`,
    values
  );

  const dataResult = await pool.query(
    `SELECT u.*, ak.name AS key_name, a.name AS application_name
     FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE ${where}
     ORDER BY u.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
    page: Number(page),
    limit: Number(limit),
  };
}

// GET /applications/:id/usage
async function listForApplication(applicationId, { page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     WHERE ak.application_id = $1`,
    [applicationId]
  );

  const dataResult = await pool.query(
    `SELECT u.*, ak.name AS key_name FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     WHERE ak.application_id = $1
     ORDER BY u.created_at DESC
     LIMIT $2 OFFSET $3`,
    [applicationId, limit, offset]
  );

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
    page: Number(page),
    limit: Number(limit),
  };
}

// GET /analytics/usage
async function getAnalytics(userId) {
  const requestsPerDay = await pool.query(
    `SELECT TO_CHAR(u.created_at, 'YYYY-MM-DD') AS day, COUNT(*) AS requests
     FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1
     GROUP BY TO_CHAR(u.created_at, 'YYYY-MM-DD')
     ORDER BY day ASC`,
    [userId]
  );

  const statusCodes = await pool.query(
    `SELECT u.status_code, COUNT(*) AS count
     FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1
     GROUP BY u.status_code
     ORDER BY u.status_code`,
    [userId]
  );

  const topEndpoints = await pool.query(
    `SELECT u.endpoint, COUNT(*) AS requests
     FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1
     GROUP BY u.endpoint
     ORDER BY requests DESC
     LIMIT 5`,
    [userId]
  );

  const avgResponseTime = await pool.query(
    `SELECT AVG(u.response_time_ms) AS avg_ms
     FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1`,
    [userId]
  );

  const requestsByApplication = await pool.query(
    `SELECT a.name AS application_name, COUNT(*) AS requests
     FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1
     GROUP BY a.name
     ORDER BY requests DESC`,
    [userId]
  );

  return {
    requestsPerDay: requestsPerDay.rows,
    statusCodes: statusCodes.rows,
    topEndpoints: topEndpoints.rows,
    averageResponseTimeMs: avgResponseTime.rows[0].avg_ms ? Number(avgResponseTime.rows[0].avg_ms) : 0,
    requestsByApplication: requestsByApplication.rows,
  };
}

module.exports = {
  logUsage,
  countRequestsInWindow,
  listForUser,
  listForApplication,
  getAnalytics,
};