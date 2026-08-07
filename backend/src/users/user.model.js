const pool = require('../database/db');

/*async function createUser({ name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}*/
async function createUser({ name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, created_at`,   // added role
    [name, email, passwordHash]
  );
  return result.rows[0];
}


async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function updatePassword(id, passwordHash) {
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2',
    [passwordHash, id]
  );
}

module.exports = { createUser, findByEmail, findById, updatePassword };