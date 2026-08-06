const usageModel = require('./usage.model');
const applicationModel = require('../applications/application.model');

async function list(req, res, next) {
  try {
    const { applicationId, status, method, from, to, page, limit } = req.query;
    const result = await usageModel.listForUser(req.user.id, {
      applicationId, status, method, from, to, page, limit,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function listForApplication(req, res, next) {
  try {
    const application = await applicationModel.findByIdAndUser(req.params.id, req.user.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const { page, limit } = req.query;
    const result = await usageModel.listForApplication(application.id, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function analytics(req, res, next) {
  try {
    const result = await usageModel.getAnalytics(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, listForApplication, analytics };