const config = {
  common: {
    outputDir: 'public',
    styles: [],
    scripts: [],
  },
  template: {
    path: 'templates', // Path where the templates are saved
    pug: {
      pretty: true,
    },
  },
  file: {
    html: {},
    json: {},
    markdown: {},
    yaml: {},
  },
  asset: {
    path: 'assets', // path to assets
    active: [],
    styles: {
      postcssPlugins: {
        prod: [ 'cssnano' ],
        dev: [],
      },
    },
    scripts: {},
    fonts: {},
    images: {
      minify: {},
    },
  },
  content: {
    path: 'content', // path to content
    active: [],
    common: {
      urlWithExtension: false,
      htmlmin: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
      },
    },
    pages: {},
    posts: {},
  },
  decorator: {
    sitemap: {},
    tags: {},
    pagination: {},
  },
};

module.exports = config;
