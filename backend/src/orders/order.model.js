const pool = require('../database/db');

async function createOrder({ applicationId, productId, quantity, subtotal, tax, total }) {
  const result = await pool.query(
    `INSERT INTO orders (application_id, product_id, quantity, subtotal, tax, total)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [applicationId, productId, quantity, subtotal, tax || 0, total]
  );
  return result.rows[0];
}

async function listByApplication(applicationId) {
  const result = await pool.query(
    `SELECT o.*, p.title AS product_title
     FROM orders o
     LEFT JOIN products p ON p.id = o.product_id
     WHERE o.application_id = $1
     ORDER BY o.created_at DESC`,
    [applicationId]
  );
  return result.rows;
}

async function findById(id, applicationId) {
  const result = await pool.query(
    'SELECT * FROM orders WHERE id = $1 AND application_id = $2',
    [id, applicationId]
  );
  return result.rows[0];
}

module.exports = { createOrder, listByApplication, findById };