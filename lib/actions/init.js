'use strict';

const fs = require('fs-extra');
const path = require('path');

function generate(basePath) {
  const files = fs.readdirSync(basePath);

  if (files.length === 0) {
    const configPath = path.join(__dirname, '..', '..', 'init_site', 'generator_config.yml');
    const assetPath = path.join(__dirname, '..', '..', 'init_site', 'assets');
    const contentPath = path.join(__dirname, '..', '..', 'init_site', 'content');
    const templatesPath = path.join(__dirname, '..', '..', 'init_site', 'templates');

    fs.copySync(configPath, path.join(basePath, 'generator_config.yml'));
    fs.copySync(assetPath, path.join(basePath, 'assets'));
    fs.copySync(contentPath, path.join(basePath, 'content'));
    fs.copySync(templatesPath, path.join(basePath, 'templates'));
  } else {
    console.log('Directory is not empty. No files will be copied');
  }
}

module.exports = generate;
