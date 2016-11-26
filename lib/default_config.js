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
    styles: {},
    scripts: {},
    fonts: {},
    images: {},
  },
  content: {
    path: 'content', // path to content
    active: [],
    global: {
      urlWithExtension: false,
    },
    pages: {},
    posts: {},
  },
  decorator: {
    sitemap: {},
    tags: {},
  },
};

module.exports = config;
