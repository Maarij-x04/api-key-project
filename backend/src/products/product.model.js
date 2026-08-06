const pool = require('../database/db');

async function createProduct({ applicationId, title, category, price, quantity, vendor }) {
  const result = await pool.query(
    `INSERT INTO products (application_id, title, category, price, quantity, vendor)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [applicationId, title, category || null, price, quantity || 0, vendor || null]
  );
  return result.rows[0];
}

async function listByApplication(applicationId) {
  const result = await pool.query(
    'SELECT * FROM products WHERE application_id = $1 ORDER BY created_at DESC',
    [applicationId]
  );
  return result.rows;
}

async function findById(id, applicationId) {
  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1 AND application_id = $2',
    [id, applicationId]
  );
  return result.rows[0];
}

async function updateProduct(id, applicationId, { title, category, price, quantity, vendor }) {
  const result = await pool.query(
    `UPDATE products
     SET title = COALESCE($1, title),
         category = COALESCE($2, category),
         price = COALESCE($3, price),
         quantity = COALESCE($4, quantity),
         vendor = COALESCE($5, vendor)
     WHERE id = $6 AND application_id = $7
     RETURNING *`,
    [title, category, price, quantity, vendor, id, applicationId]
  );
  return result.rows[0];
}

async function deleteProduct(id, applicationId) {
  const result = await pool.query(
    'DELETE FROM products WHERE id = $1 AND application_id = $2 RETURNING id',
    [id, applicationId]
  );
  return result.rows[0];
}

module.exports = { createProduct, listByApplication, findById, updateProduct, deleteProduct };