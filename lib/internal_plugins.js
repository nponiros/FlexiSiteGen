'use strict';

// TODO Create an object with there
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
].map((p) => `./plugins/${p}`);

module.exports = internalPluginPaths;
