const applicationModel = require('./application.model');
const auditService = require('../audit/audit.service');

async function create(req, res, next) {
  try {
    const { name, description, environment } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const app = await applicationModel.createApplication({
      userId: req.user.id,
      name,
      description,
      environment,
    });

    await auditService.logAction({
      userId: req.user.id,
      applicationId: app.id,
      entityType: 'application',
      entityId: app.id,
      action: 'created',
      newValues: app,
      ipAddress: req.ip,
    });

    res.status(201).json({ application: app });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const result = await applicationModel.listByUser(req.user.id, { page, limit, search, status });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const app = await applicationModel.findByIdAndUser(req.params.id, req.user.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    res.json({ application: app });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const existing = await applicationModel.findByIdAndUser(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Application not found' });

    const { name, description, environment, status } = req.body;
    const updated = await applicationModel.updateApplication(req.params.id, req.user.id, {
      name,
      description,
      environment,
      status,
    });

    await auditService.logAction({
      userId: req.user.id,
      applicationId: updated.id,
      entityType: 'application',
      entityId: updated.id,
      action: 'updated',
      oldValues: existing,
      newValues: updated,
      ipAddress: req.ip,
    });

    res.json({ application: updated });
  } catch (err) {
    next(err);
  }
}

// async function remove(req, res, next) {
//   try {
//     const existing = await applicationModel.findByIdAndUser(req.params.id, req.user.id);
//     if (!existing) return res.status(404).json({ error: 'Application not found' });

//     await applicationModel.deleteApplication(req.params.id, req.user.id);

//     await auditService.logAction({
//       userId: req.user.id,
//       applicationId: existing.id,
//       entityType: 'application',
//       entityId: existing.id,
//       action: 'deleted',
//       oldValues: existing,
//       ipAddress: req.ip,
//     });

//     res.json({ message: 'Application deleted', id: existing.id });
//   } catch (err) {
//     next(err);
//   }
// }
async function remove(req, res, next) {
  try {
    const existing = await applicationModel.findByIdAndUser(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Application not found' });

    // Log BEFORE deleting — the application still exists at this point,
    // so the foreign key in audit_logs.application_id is satisfied.
    await auditService.logAction({
      userId: req.user.id,
      applicationId: existing.id,
      entityType: 'application',
      entityId: existing.id,
      action: 'deleted',
      oldValues: existing,
      ipAddress: req.ip,
    });

    await applicationModel.deleteApplication(req.params.id, req.user.id);

    res.json({ message: 'Application deleted', id: existing.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, update, remove };