const applicationModel = require('../applications/application.model');
const apiKeyModel = require('./apiKey.model');
const auditService = require('../audit/audit.service');
const { generateApiKey } = require('../common/generateKey');
const { hashKey } = require('../common/hash');

// POST /applications/:id/api-keys
async function create(req, res, next) {
  try {
    const application = await applicationModel.findByIdAndUser(req.params.id, req.user.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const { name, scopes, rateLimit, expiresAt } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const { key, prefix } = generateApiKey();
    const keyHash = hashKey(key);

    const saved = await apiKeyModel.createApiKey({
      applicationId: application.id,
      name,
      keyHash,
      keyPrefix: prefix,
      scopes,
      expiresAt,
      rateLimit,
    });

    await auditService.logAction({
      userId: req.user.id,
      applicationId: application.id,
      entityType: 'api_key',
      entityId: saved.id,
      action: 'generated_key',
      newValues: saved,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Save this key now — it will not be shown again.',
      apiKey: key,
      ...saved,
    });
  } catch (err) {
    next(err);
  }
}

// GET /applications/:id/api-keys
async function listForApplication(req, res, next) {
  try {
    const application = await applicationModel.findByIdAndUser(req.params.id, req.user.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const keys = await apiKeyModel.listByApplication(application.id);
    res.json({ apiKeys: keys });
  } catch (err) {
    next(err);
  }
}

// GET /api-keys/:id
async function getOne(req, res, next) {
  try {
    const key = await apiKeyModel.findByIdForUser(req.params.id, req.user.id);
    if (!key) return res.status(404).json({ error: 'API key not found' });
    res.json({ apiKey: key });
  } catch (err) {
    next(err);
  }
}

// PATCH /api-keys/:id — update scopes (and optionally rate limit)
async function update(req, res, next) {
  try {
    const existing = await apiKeyModel.findByIdForUser(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'API key not found' });

    const { scopes, rateLimit } = req.body;
    let updated = existing;

    if (scopes) {
      updated = await apiKeyModel.updateScopes(existing.id, scopes);
      await auditService.logAction({
        userId: req.user.id,
        applicationId: existing.application_id,
        entityType: 'api_key',
        entityId: existing.id,
        action: 'changed_scopes',
        oldValues: { scopes: existing.scopes },
        newValues: { scopes: updated.scopes },
        ipAddress: req.ip,
      });
    }

    if (rateLimit) {
      updated = await apiKeyModel.updateRateLimit(existing.id, rateLimit);
      await auditService.logAction({
        userId: req.user.id,
        applicationId: existing.application_id,
        entityType: 'api_key',
        entityId: existing.id,
        action: 'changed_rate_limit',
        oldValues: { rate_limit: existing.rate_limit },
        newValues: { rate_limit: updated.rate_limit },
        ipAddress: req.ip,
      });
    }

    res.json({ apiKey: updated });
  } catch (err) {
    next(err);
  }
}

// POST /api-keys/:id/rotate — old key revoked, new one generated in its place
async function rotate(req, res, next) {
  try {
    const existing = await apiKeyModel.findByIdForUser(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'API key not found' });

    await apiKeyModel.revoke(existing.id);

    const { key, prefix } = generateApiKey();
    const keyHash = hashKey(key);

    const newKey = await apiKeyModel.createApiKey({
      applicationId: existing.application_id,
      name: existing.name,
      keyHash,
      keyPrefix: prefix,
      scopes: existing.scopes,
      rateLimit: existing.rate_limit,
      expiresAt: existing.expires_at,
    });

    await auditService.logAction({
      userId: req.user.id,
      applicationId: existing.application_id,
      entityType: 'api_key',
      entityId: newKey.id,
      action: 'rotated_key',
      oldValues: { revokedKeyId: existing.id },
      newValues: newKey,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Key rotated. Save the new key now — it will not be shown again.',
      apiKey: key,
      ...newKey,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api-keys/:id/revoke
async function revokeKey(req, res, next) {
  try {
    const existing = await apiKeyModel.findByIdForUser(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'API key not found' });
    if (existing.revoked_at) return res.status(400).json({ error: 'This key is already revoked' });

    const revoked = await apiKeyModel.revoke(existing.id);

    await auditService.logAction({
      userId: req.user.id,
      applicationId: existing.application_id,
      entityType: 'api_key',
      entityId: existing.id,
      action: 'revoked_key',
      oldValues: { revoked_at: existing.revoked_at },
      newValues: { revoked_at: revoked.revoked_at },
      ipAddress: req.ip,
    });

    res.json({ apiKey: revoked });
  } catch (err) {
    next(err);
  }
}

// PATCH /api-keys/:id/restore
async function restoreKey(req, res, next) {
  try {
    const existing = await apiKeyModel.findByIdForUser(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'API key not found' });
    if (!existing.revoked_at) return res.status(400).json({ error: 'This key is not revoked' });

    const restored = await apiKeyModel.restore(existing.id);

    await auditService.logAction({
      userId: req.user.id,
      applicationId: existing.application_id,
      entityType: 'api_key',
      entityId: existing.id,
      action: 'restored_key',
      oldValues: { revoked_at: existing.revoked_at },
      newValues: { revoked_at: null },
      ipAddress: req.ip,
    });

    res.json({ apiKey: restored });
  } catch (err) {
    next(err);
  }
}

// DELETE /api-keys/:id
async function remove(req, res, next) {
  try {
    const existing = await apiKeyModel.findByIdForUser(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'API key not found' });

    // Log BEFORE deleting — same foreign-key lesson as applications.
    await auditService.logAction({
      userId: req.user.id,
      applicationId: existing.application_id,
      entityType: 'api_key',
      entityId: existing.id,
      action: 'deleted_key',
      oldValues: existing,
      ipAddress: req.ip,
    });

    await apiKeyModel.deleteKey(existing.id);

    res.json({ message: 'API key deleted', id: existing.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listForApplication, getOne, update, rotate, revokeKey, restoreKey, remove };