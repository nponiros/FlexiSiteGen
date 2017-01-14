'use strict';

const pug = require('pug');

const compiledTemplates = new Map();

function processs(templateName, template, options, templateVariables) {
  // pug needs this for relative extends
  options.filename = options.filenameWithPath;
  if (compiledTemplates.has(templateName)) {
    return compiledTemplates.get(templateName)(templateVariables);
  }
  const compiledTemplate = pug.compile(template, options);
  compiledTemplates.set(templateName, compiledTemplate);
  return compiledTemplate(templateVariables);
}

const type = 'template';
const name = 'pug';
const extensions = ['.pug'];
function registration(register) {
  register(type, name, extensions, processs);
}

module.exports = registration;
