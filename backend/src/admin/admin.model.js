const pool = require('../database/db');

async function listAllUsers({ page = 1, limit = 20, search }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let i = 1;

  if (search) {
    conditions.push(`(name ILIKE $${i} OR email ILIKE $${i})`);
    values.push(`%${search}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*) AS total FROM users ${where}`, values);
  const dataResult = await pool.query(
    `SELECT id, name, email, role, created_at FROM users ${where}
     ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );

  return { data: dataResult.rows, total: parseInt(countResult.rows[0].total, 10), page: Number(page), limit: Number(limit) };
}

async function getUserDetail(userId) {
  const user = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]);
  if (!user.rows[0]) return null;

  const applications = await pool.query('SELECT * FROM applications WHERE user_id = $1', [userId]);
  const apiKeyCount = await pool.query(
    `SELECT COUNT(*) AS total FROM api_keys ak
     JOIN applications a ON a.id = ak.application_id
     WHERE a.user_id = $1`,
    [userId]
  );

  return {
    user: user.rows[0],
    applications: applications.rows,
    apiKeyCount: parseInt(apiKeyCount.rows[0].total, 10),
  };
}

async function updateUser(userId, { name, role }) {
  const result = await pool.query(
    `UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role), updated_at = now()
     WHERE id = $3 RETURNING id, name, email, role`,
    [name, role, userId]
  );
  return result.rows[0];
}

async function deleteUser(userId) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
  return result.rows[0];
}

// Unscoped — every application across every user
async function listAllApplications({ page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const countResult = await pool.query('SELECT COUNT(*) AS total FROM applications');
  const dataResult = await pool.query(
    `SELECT a.*, u.name AS owner_name, u.email AS owner_email
     FROM applications a JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return { data: dataResult.rows, total: parseInt(countResult.rows[0].total, 10), page: Number(page), limit: Number(limit) };
}

// Unscoped — every audit log across every user
async function listAllAuditLogs({ page = 1, limit = 20, action, entityType }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let i = 1;

  if (action) { conditions.push(`action = $${i}`); values.push(action); i++; }
  if (entityType) { conditions.push(`entity_type = $${i}`); values.push(entityType); i++; }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*) AS total FROM audit_logs ${where}`, values);
  const dataResult = await pool.query(
    `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );
  return { data: dataResult.rows, total: parseInt(countResult.rows[0].total, 10), page: Number(page), limit: Number(limit) };
}

module.exports = { listAllUsers, getUserDetail, updateUser, deleteUser, listAllApplications, listAllAuditLogs };