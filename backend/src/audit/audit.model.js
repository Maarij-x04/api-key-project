const pool = require('../database/db');

// Filterable, paginated list — scoped to the logged-in user's own audit trail.
async function listForUser(userId, { applicationId, action, entityType, from, to, page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  const conditions = ['user_id = $1'];
  const values = [userId];
  let i = 2;

  if (applicationId) {
    conditions.push(`application_id = $${i}`);
    values.push(applicationId);
    i++;
  }
  if (action) {
    conditions.push(`action = $${i}`);
    values.push(action);
    i++;
  }
  if (entityType) {
    conditions.push(`entity_type = $${i}`);
    values.push(entityType);
    i++;
  }
  if (from) {
    conditions.push(`created_at >= $${i}`);
    values.push(from);
    i++;
  }
  if (to) {
    conditions.push(`created_at <= $${i}`);
    values.push(to);
    i++;
  }

  const where = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM audit_logs WHERE ${where}`,
    values
  );

  const dataResult = await pool.query(
    `SELECT * FROM audit_logs
     WHERE ${where}
     ORDER BY created_at DESC
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


async function findByIdForUser(id, userId) {
  const result = await pool.query(
    'SELECT * FROM audit_logs WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0];
}

module.exports = { listForUser, findByIdForUser };