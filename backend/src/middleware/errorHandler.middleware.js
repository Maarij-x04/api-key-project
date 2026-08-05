function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({ error: err.publicMessage || 'Something went wrong on the server' });
}

module.exports = { errorHandler };