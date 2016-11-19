'use strict';

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}) {
  const config = Object.assign({}, globalConfig, processorGlobalConfig, processorConfig);

  function read() {
    return [];
  }

  function createLocals(sitemap, fns, dependencies) {
    const sitemapLocals = [];
    for (const dep in dependencies) {
      if (dependencies.hasOwnProperty(dep)) {
        dependencies[dep].forEach((d) => {
          sitemapLocals.push(d.meta.url);
        });
      }
    }
    return sitemapLocals;
  }

  function createSitemap(domain, urls) {
    const prefix = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const urlsString = urls.map((url) => {
      const urlPrefix = '  <url>\n';
      const loc = `    <loc>${domain}/${url}</loc>\n`;
      const urlSuffix = '  </url>';
      return urlPrefix + loc + urlSuffix;
    }).join('\n');
    const suffix = '\n</urlset>';
    return prefix + urlsString + suffix;
  }

  function process(sitemapWithLocals) {
    const next = {};
    const domain = config.domain;

    next.writePath = 'sitemap';
    next.contentsToWrite = createSitemap(domain, sitemapWithLocals.locals.sitemap);
    return next;
  }

  function postprocess(sitemap) {
    if (config.productionMode) {
      sitemap.contentsToWrite = sitemap.contentsToWrite.replace(/\n/g, '').replace(/\s\s+/g, '');
      return sitemap;
    } else {
      return sitemap;
    }
  }

  function write(sitemap, { writers }) {
    writers.file(`${config.outputDir}/${sitemap.writePath}.xml`, sitemap.contentsToWrite);
  }

  return {
    read,
    preprocess,
    createLocals,
    process,
    postprocess,
    write
  };
}

const type = 'decorator';
const name = 'sitemap';
const dependsOn = {
  assets: [],
  contents: ['posts', 'pages']
};
function registration(register) {
  register(type, name, dependsOn, init);
}
module.exports = registration;
