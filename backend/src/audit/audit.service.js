const pool = require('../database/db');

async function logAction({ userId, applicationId, entityType, entityId, action, oldValues, newValues, ipAddress }) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, application_id, entity_type, entity_id, action, old_values, new_values, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      userId || null,
      applicationId || null,
      entityType || null,
      entityId || null,
      action,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress || null,
    ]
  );
}

module.exports = { logAction };