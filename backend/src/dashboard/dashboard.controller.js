const dashboardModel = require('./dashboard.model');

async function summary(req, res, next) {
  try {
    const data = await dashboardModel.getSummary(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function requestChart(req, res, next) {
  try {
    const data = await dashboardModel.getRequestChart(req.user.id);
    res.json({ chart: data });
  } catch (err) {
    next(err);
  }
}

async function statusChart(req, res, next) {
  try {
    const data = await dashboardModel.getStatusChart(req.user.id);
    res.json({ chart: data });
  } catch (err) {
    next(err);
  }
}

async function topApplications(req, res, next) {
  try {
    const data = await dashboardModel.getTopApplications(req.user.id);
    res.json({ applications: data });
  } catch (err) {
    next(err);
  }
}

async function topEndpoints(req, res, next) {
  try {
    const data = await dashboardModel.getTopEndpoints(req.user.id);
    res.json({ endpoints: data });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary, requestChart, statusChart, topApplications, topEndpoints };