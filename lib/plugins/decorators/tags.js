'use strict';

const minify = require('html-minifier').minify;

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}) {
  const config = Object.assign({}, globalConfig, processorGlobalConfig, processorConfig);

  function read() {
    return [];
  }

  function createLocals(tags, fns, dependencies) {
    const tagsLocal = {};
    dependencies.posts.forEach((post) => {
      post.meta.tags.forEach((tag) => {
        if (tagsLocal[tag]) {
          tagsLocal[tag].posts.push(post);
        } else {
          tagsLocal[tag] = {
            label: tag,
            url: 'tags#' + tag,
            id: tag,
            posts: [post]
          };
        }
      });
    });

    return tagsLocal;
  }

  function process(tagsWithLocals, renderTemplate) {
    const next = {};
    next.writePath = 'tags';
    next.contentsToWrite = renderTemplate(config.template, tagsWithLocals.locals);
    return next;
  }

  function postprocess(tags) {
    if (config.productionMode) {
      tags.contentsToWrite = minify(tags.contentsToWrite, config.htmlmin);
      return tags;
    } else {
      return tags;
    }
  }

  function write(tags, writers) {
    writers.file(`${config.outputDir}/${tags.writePath}.html`, tags.contentsToWrite);
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
const name = 'tags';
const dependsOn = {
  assets: [],
  contents: ['posts']
};
function registration(register) {
  register(type, name, dependsOn, init);
}
module.exports = registration;
