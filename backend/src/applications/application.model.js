const pool = require('../database/db');

async function createApplication({ userId, name, description, environment }) {
  const result = await pool.query(
    `INSERT INTO applications (user_id, name, description, environment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, name, description || null, environment || 'production']
  );
  return result.rows[0];
}

async function findByIdAndUser(id, userId) {
  const result = await pool.query(
    'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0];
}

async function listByUser(userId, { page = 1, limit = 10, search, status }) {
  const offset = (page - 1) * limit;
  const conditions = ['user_id = $1'];
  const values = [userId];
  let paramIndex = 2;

  if (search) {
    conditions.push(`name ILIKE $${paramIndex}`);
    values.push(`%${search}%`);
    paramIndex++;
  }
  if (status) {
    conditions.push(`status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM applications WHERE ${whereClause}`,
    values
  );

  const dataResult = await pool.query(
    `SELECT * FROM applications
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  );

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
    page: Number(page),
    limit: Number(limit),
  };
}

async function updateApplication(id, userId, { name, description, environment, status }) {
  const result = await pool.query(
    `UPDATE applications
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         environment = COALESCE($3, environment),
         status = COALESCE($4, status),
         updated_at = now()
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [name, description, environment, status, id, userId]
  );
  return result.rows[0];
}

async function deleteApplication(id, userId) {
  const result = await pool.query(
    'DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rows[0];
}

module.exports = {
  createApplication,
  findByIdAndUser,
  listByUser,
  updateApplication,
  deleteApplication,
};