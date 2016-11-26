'use strict';

const update = require('immutability-helper');
const extendify = require('extendify');
const extend = extendify({
  inPlace: false,
  arrays: 'concat'
});

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}) {
  const config = extend(globalConfig, processorGlobalConfig, processorConfig);
  
  function read(basePath, { readers, processContent }) {
    return processContent.read(basePath, readers);
  }

  // If page in directory need some meta
  // if page a file use front-matter
  function preprocess(pages, { processFile, processContent }) {
    return processContent.preprocess(pages, processFile);
  }
  
  function templateVariables(pages, { createStyles, createScripts }, db) {
    return pages.map((page) => {
      const styles = createStyles(config.styles, page.meta, db.get('templateVariables').styles.object);
      const scripts = createScripts(config.scripts, page.meta, db.get('templateVariables').scripts.object);
      
      const meta = Object.assign({}, page.meta);
      const content = Object.assign({}, page.content);
      return Object.assign(
          {},
          { id: page.id, content, styles, scripts }, {
            meta: update(meta, {
              $merge: {
                url: `${page.meta.url || page.fileName}${config.urlWithExtension ? '.html' : ''}`
              }
            })
          });
    });
  }

  function process(pagesWithLocals, { renderTemplate, processContent }, db) {
    return processContent.process(pagesWithLocals, 'pages', renderTemplate, config, db);
  }

  function postprocess(pages, { processContent }) {
    return processContent.postprocess(pages, config);
  }

  function write(pages, { writers, processContent }) {
    processContent.write(pages, writers, config);
  }

  return {
    read,
    preprocess,
    templateVariables,
    process,
    postprocess,
    write
  };
}

const type = 'content';
const name = 'pages';
function registration(register) {
  register(type, name, init);
}
module.exports = registration;
