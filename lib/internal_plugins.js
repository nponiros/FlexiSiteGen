'use strict';

const internalPlugins = {
  asset: ['styles', 'scripts', 'fonts', 'images'].map((p) => `./plugins/asset/${p}`),
  content: ['pages', 'posts'].map((p) => `./plugins/content/${p}`),
  decorator: ['tags', 'sitemap', 'pagination'].map((p) => `./plugins/decorator/${p}`),
  file: ['html', 'json', 'markdown', 'yaml'].map((p) => `./plugins/file/${p}`),
  helpers: ['body_splitter', 'create_scripts', 'create_styles', 'readers', 'writers'].map((p) => `./plugins/helpers/${p}`),
  template: ['pug'].map((p) => `./plugins/template/${p}`),
};

module.exports = internalPlugins;
