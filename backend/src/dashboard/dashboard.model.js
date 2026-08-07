const pool = require('../database/db');

async function getSummary(userId) {
  const applicationsResult = await pool.query(
    'SELECT COUNT(*) AS total FROM applications WHERE user_id = $1',
    [userId]
  );

  const activeKeysResult = await pool.query(
    `SELECT COUNT(*) AS total FROM api_keys ak
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1 AND ak.revoked_at IS NULL`,
    [userId]
  );

  const totalRequestsResult = await pool.query(
    `SELECT COUNT(*) AS total FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1`,
    [userId]
  );

  const requestsTodayResult = await pool.query(
    `SELECT COUNT(*) AS total FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1 AND u.created_at >= CURRENT_DATE`,
    [userId]
  );

  const failedRequestsResult = await pool.query(
    `SELECT COUNT(*) AS total FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1 AND u.status_code >= 400`,
    [userId]
  );

  const avgResponseResult = await pool.query(
    `SELECT AVG(u.response_time_ms) AS avg_ms FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1`,
    [userId]
  );

  return {
    applications: parseInt(applicationsResult.rows[0].total, 10),
    apiKeys: parseInt(activeKeysResult.rows[0].total, 10),
    totalRequests: parseInt(totalRequestsResult.rows[0].total, 10),
    requestsToday: parseInt(requestsTodayResult.rows[0].total, 10),
    failedRequests: parseInt(failedRequestsResult.rows[0].total, 10),
    averageResponseTime: avgResponseResult.rows[0].avg_ms
      ? Math.round(Number(avgResponseResult.rows[0].avg_ms))
      : 0,
  };
}

async function getRequestChart(userId) {
  const result = await pool.query(
    `SELECT TO_CHAR(u.created_at, 'YYYY-MM-DD') AS day, COUNT(*) AS requests
     FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1
     GROUP BY TO_CHAR(u.created_at, 'YYYY-MM-DD')
     ORDER BY day ASC`,
    [userId]
  );
  return result.rows;
}

async function getStatusChart(userId) {
  const result = await pool.query(
    `SELECT u.status_code, COUNT(*) AS count
     FROM api_usage u
     JOIN api_keys ak ON ak.id = u.api_key_id
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1
     GROUP BY u.status_code
     ORDER BY u.status_code`,
    [userId]
  );
  return result.rows;
}

async function getTopApplications(userId) {
  const result = await pool.query(
    `SELECT a.id, a.name, COUNT(u.id) AS requests
     FROM applications a
     LEFT JOIN api_keys ak ON ak.application_id = a.id
     LEFT JOIN api_usage u ON u.api_key_id = ak.id
     WHERE a.user_id = $1
     GROUP BY a.id, a.name
     ORDER BY requests DESC
     LIMIT 5`,
    [userId]
  );
  return result.rows;
}

async function getTopEndpoints(userId) {
  const result = await pool.query(
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
  return result.rows;
}

module.exports = { getSummary, getRequestChart, getStatusChart, getTopApplications, getTopEndpoints };