'use strict';

const internalPluginPaths = [
  'content/pages',
  'content/posts',
  'asset/scripts',
  'asset/styles',
  'asset/fonts',
  'asset/images',
  'decorators/tags',
  'decorators/archive',
  'decorators/sitemap'
].map((p) => `./plugins/${p}`);

module.exports = internalPluginPaths;
