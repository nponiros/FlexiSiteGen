'use strict';

function process(fileContents, opts) {
  const reviver = opts && opts.reviver;
  return JSON.parse(fileContents, reviver);
}

const processor = {
  process
};

const type = 'file';
const name = 'json';
const extensions = ['.json'];
function registration(register) {
  register(type, name, extensions, processor);
}

module.exports = registration;
