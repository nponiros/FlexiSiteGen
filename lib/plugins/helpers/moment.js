const moment = require('moment');

const type = 'helper';
const name = 'moment';
function registration(register) {
  register(type, name, moment);
}

module.exports = registration;
