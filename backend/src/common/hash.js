const crypto = require('crypto');

// One-way hash of the raw key — this is what actually gets stored in the DB
function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

module.exports = { hashKey };