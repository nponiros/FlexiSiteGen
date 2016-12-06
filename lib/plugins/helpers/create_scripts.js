'use strict';

const creator = require('./create_scripts_and_styles');

function createLocalScripts(configScripts, { scripts = [] }, scriptTemplateVariables) {
  // Scripts defined for this resource
  const contentScripts = [...configScripts, ...scripts];

  return creator(contentScripts, scriptTemplateVariables);
}

const type = 'helper';
const name = 'createScripts';
function registration(register) {
  register(type, name, createLocalScripts);
}

module.exports = registration;
