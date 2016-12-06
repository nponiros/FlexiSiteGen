'use strict';

const fs = require('fs');
const path = require('path');

function read(basePath, templates, readers, subdir) {
  const templatePaths = readers.dir(basePath);
  templatePaths.map((templatePath) => {
    const stats = fs.statSync(templatePath);
    /* istanbul ignore else */
    if (stats.isFile()) {
      const key = `${(subdir ? './' + subdir + '/' : '')}${path.basename(templatePath)}`;
      const ext = path.extname(key);
      const name = key.replace(ext, '');
      templates.set(name, { ext: '.pug', template: readers.fileToString(templatePath) });
    } else if (stats.isDirectory()) {
      read(templatePath, templates, readers, path.basename(templatePath));
    } else {
      throw Error('Template not supported!');
    }
  });
}

module.exports = read;
