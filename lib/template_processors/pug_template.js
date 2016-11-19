'use strict';

const fs = require('fs');
const path = require('path');

const pug = require('pug');

const templates = new Map();

function read(basePath, readers, subdir) {
  const templatePaths = readers.dir(basePath);
  templatePaths.map((templatePath) => {
    const stats = fs.statSync(templatePath);
    if (stats.isFile()) {
      const key = `${(subdir ? './' + subdir + '/' : '')}${path.basename(templatePath)}`;
      templates.set(key, readers.fileToString(templatePath));
    } else if (stats.isDirectory()) {
      read(templatePath, readers, path.basename(templatePath));
    } else {
      throw Error('Template not supported!');
    }
  });
}

function renderTemplate(name, locals) {
  const ext = '.pug';
  locals.basedir = process.cwd() + '/templates';
  locals.pretty = true;
  const templateName = name + ext;
  if (templates.get(templateName)) {
    return pug.render(templates.get(templateName), locals);
  } else {
    throw Error('Template: "' + templateName + '" does not exist');
  }
}

module.exports = {
  renderTemplate,
  read,
};
