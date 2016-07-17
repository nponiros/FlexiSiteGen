'use strict';

const extendify = require('extendify');
const extend = extendify({
  inPlace: false,
  arrays: 'concat'
});

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}, genericContentProcessor) {
  const config = extend(globalConfig, processorGlobalConfig, processorConfig);
  
  function read(basePath, readers) {
    return genericContentProcessor.read(basePath, readers);
  }

  // If page in directory need some meta
  // if page a file use front-matter
  function preprocess(pages, processFile) {
    return genericContentProcessor.preprocess(pages, processFile);
  }
  
  function createLocals(pages, fns, deps) {
    return pages.map((page) => {
      const styles = fns.createStyles(config.styles, page.meta, deps.styles.object);
      const scripts = fns.createScripts(config.scripts, page.meta, deps.scripts.object);
      
      const meta = Object.assign({}, page.meta);
      const content = Object.assign({}, page.content);
      return Object.assign(
          {},
          {
            meta,
            content,
            styles,
            scripts,
          }, {
            meta: {
              url: `${page.meta.url || page.fileName}${config.urlWithExtension ? '.html' : ''}`
            },
          }
      );
    });
  }

  function process(pagesWithLocals, renderTemplate) {
    return genericContentProcessor.process(pagesWithLocals, 'pages', renderTemplate, config);
  }

  function postprocess(pages) {
    return genericContentProcessor.postprocess(pages, config);
  }

  function write(pages, writers) {
    genericContentProcessor.write(pages, writers, config);
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

const type = 'content';
const name = 'pages';
const dependsOn = {
  assets: ['scripts', 'styles'],
  contents: []
};
function registration(register) {
  register(type, name, dependsOn, init);
}
module.exports = registration;
