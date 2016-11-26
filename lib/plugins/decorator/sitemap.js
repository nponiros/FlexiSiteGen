'use strict';

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}) {
  const config = Object.assign({}, globalConfig, processorGlobalConfig, processorConfig);

  function templateVariables(sitemap, fns, db) {
    const sitemapLocals = [];
    const templateVariables = db.get('templateVariables');

    return config.createMapFor
      .map((type) => templateVariables[type].map((content) => content.meta.url))
      .reduce((arr, cur) => [...arr, ...cur], []);
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

  function process(sitemapWithLocals, helperFns, db) {
    const next = {};
    const domain = config.domain;

    next.writePath = 'sitemap';
    next.contentsToWrite = createSitemap(domain, db.get('templateVariables').sitemap);
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
    templateVariables,
    process,
    postprocess,
    write
  };
}

const type = 'decorator';
const name = 'sitemap';
function registration(register) {
  register(type, name, init);
}
module.exports = registration;
