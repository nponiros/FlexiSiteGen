'use strict';

const internalPluginPaths = [
  'content/posts',
  'content/pages',
  'asset/scripts',
  'asset/styles',
  'asset/fonts',
  'asset/images',
  'decorators/tags',
  'decorators/archive',
  'decorators/sitemap',
  'file_processors/html',
  'file_processors/json',
  'file_processors/markdown',
  'file_processors/yaml',
  'helpers/body_splitter',
  'helpers/create_scripts',
  'helpers/create_styles',
  'helpers/readers',
  'helpers/writers',
  'template_processors/pug',
].map((p) => `./plugins/${p}`);

module.exports = internalPluginPaths;
