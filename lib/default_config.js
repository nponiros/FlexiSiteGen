const config = {
  common: {
    outputDir: 'public',
    styles: [],
    scripts: [],
    urlWithExtension: false,
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
      postcss: {
        plugins: {
          prod: [{ name: 'cssnano' }],
          dev: [],
        },
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
      htmlmin: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
      },
    },
    pages: {},
    posts: {
      urlFormat: '_blog/${year}/${month}/${date}/', // eslint-disable-line
    },
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
