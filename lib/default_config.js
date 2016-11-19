const config = {
  global: {
    outputDir: 'public',
    htmlmin: {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
    },
    styles: [],
    scripts: [],
  },
  templateProcessors: {
    path: 'templates', // Path where the templates are saved
    pug: {
      pretty: true,
    },
  },
  fileProcessors: {
    html: {},
    json: {},
    markdown: {},
    yaml: {},
  },
  assetProcessors: {
    path: 'assets', // path to assets
    active: [],
    styles: {},
    scripts: {},
    fonts: {},
    images: {},
  },
  contentProcessors: {
    path: 'content', // path to content
    active: [],
    global: {
      urlWithExtension: false,
    },
    pages: {},
    posts: {}
  },
  decorators: {
    sitemap: {},
    tags: {},
  }
};

module.exports = config;
