'use strict';

const pug = require('pug');

function processs(template, options, templateVariables) {
  // pug needs this for relative extends
  options.filename = options.filenameWithPath;
  return pug.compile(template, options)(templateVariables);
}

const type = 'template';
const name = 'pug';
const extensions = ['.pug'];
function registration(register) {
  register(type, name, extensions,processs);
}

module.exports = registration;
