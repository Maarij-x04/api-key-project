const adminModel = require('./admin.model');
const auditService = require('../audit/audit.service');

async function listUsers(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const result = await adminModel.listAllUsers({ page, limit, search });
    res.json(result);
  } catch (err) { next(err); }
}

async function getUser(req, res, next) {
  try {
    const detail = await adminModel.getUserDetail(req.params.id);
    if (!detail) return res.status(404).json({ error: 'User not found' });
    res.json(detail);
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const { name, role } = req.body;
    const updated = await adminModel.updateUser(req.params.id, { name, role });
    if (!updated) return res.status(404).json({ error: 'User not found' });

    await auditService.logAction({
      userId: req.user.id,
      entityType: 'user',
      entityId: updated.id,
      action: 'admin_updated_user',
      newValues: updated,
      ipAddress: req.ip,
    });

    res.json({ user: updated });
  } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    await auditService.logAction({
      userId: req.user.id,
      entityType: 'user',
      entityId: Number(req.params.id),
      action: 'admin_deleted_user',
      ipAddress: req.ip,
    });

    const deleted = await adminModel.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted', id: deleted.id });
  } catch (err) { next(err); }
}

async function listApplications(req, res, next) {
  try {
    const result = await adminModel.listAllApplications(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

async function listAuditLogs(req, res, next) {
  try {
    const result = await adminModel.listAllAuditLogs(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { listUsers, getUser, updateUser, deleteUser, listApplications, listAuditLogs };