'use strict';

const creator = require('./create_scripts_and_styles');

function createLocalScripts(configStyles, { styles = [] }, styleTemplateVariables) {
  // Styles defined for this resource
  const contentStyles = [...configStyles, ...styles];

  return creator(contentStyles, styleTemplateVariables);
}

const type = 'helper';
const name = 'createStyles';
function registration(register) {
  register(type, name, createLocalScripts);
}

module.exports = registration;
