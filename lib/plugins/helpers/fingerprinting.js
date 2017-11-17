'use strict';

const fingerprinting = require('fingerprinting');

function fingerprint(filename, content, options) {
  const fingerprintingOptions = Object.assign({}, options, { content });
  return fingerprinting(filename, fingerprintingOptions);
}

const type = 'helper';
const name = 'fingerprint';
function registration(register) {
  register(type, name, fingerprint);
}

module.exports = registration;
