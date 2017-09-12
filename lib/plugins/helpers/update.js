const update = require('immutability-helper');

const type = 'helper';
const name = 'update';
function registration(register) {
  register(type, name, update);
}

module.exports = registration;
