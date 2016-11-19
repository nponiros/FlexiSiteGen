'use strict';

const yaml = require('js-yaml');

function process(fileContents, opts) {
  return yaml.safeLoad(fileContents, opts);
}

const type = 'file';
const name = 'yaml';
const extensions = ['.yaml', '.yml'];
function registration(register) {
  register(type, name, extensions, process);
}

module.exports = registration;
