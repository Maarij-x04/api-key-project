const auditModel = require('./audit.model');

async function list(req, res, next) {
  try {
    const { applicationId, action, entityType, from, to, page, limit } = req.query;
    const result = await auditModel.listForUser(req.user.id, {
      applicationId, action, entityType, from, to, page, limit,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const record = await auditModel.findByIdForUser(req.params.id, req.user.id);
    if (!record) return res.status(404).json({ error: 'Audit record not found' });
    res.json({ auditLog: record });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne };