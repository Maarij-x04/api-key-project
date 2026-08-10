// const crypto = require('crypto');

// function generateApiKey() {
//   const key = crypto.randomBytes(32).toString('hex'); // the actual secret, shown once
//   const prefix = key.slice(0, 8); // safe to store/display, used to identify the key later

//   return { key, prefix };
// }

// module.exports = { generateApiKey };

const crypto = require('crypto');

function generateApiKey(environment = 'production') {
  const randomPart = crypto.randomBytes(32).toString('hex');
  const prefixTag = environment === 'production' ? 'sk_live_' : 'sk_test_';
  const key = `${prefixTag}${randomPart}`;
  const prefix = `${key.slice(0, 15)}...`;
  return { key, prefix };
}


module.exports = { generateApiKey };