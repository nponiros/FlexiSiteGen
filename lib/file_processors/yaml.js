'use strict';

const yaml = require('js-yaml');

function process(fileContents, opts) {
  return yaml.safeLoad(fileContents, opts);
}

const processor = {
  process
};

const name = 'yaml';
const extensions = ['.yaml', '.yml'];
function registration(register) {
  register(name, extensions, processor);
}

module.exports = registration;
