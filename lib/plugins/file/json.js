'use strict';

function process(fileContents) {
  return JSON.parse(fileContents);
}

const type = 'file';
const name = 'json';
const extensions = ['.json'];
function registration(register) {
  register(type, name, extensions, process);
}

module.exports = registration;
