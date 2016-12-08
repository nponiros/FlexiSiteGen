const config = {
  common: {
    outputDir: 'public',
    styles: [],
    scripts: [],
  },
  template: {
    common: {
      path: 'templates', // Path where the templates are
    },
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
    active: [],
    common: {
      path: 'assets', // path to assets
    },
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
    active: [],
    common: {
      path: 'content', // path to content
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
    active: [],
    common: {},
    sitemap: {},
    tags: {},
    pagination: {},
  },
};

module.exports = config;
