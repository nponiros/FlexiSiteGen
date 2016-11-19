'use strict';

const path = require('path');
const moment = require('moment');

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

  function read(basePath, { readers }) {
    return genericContentProcessor.read(basePath, readers);
  }

  function preprocess(posts, { processFile }) {
    return genericContentProcessor.preprocess(posts, processFile);
  }

  function createURL(postName, momentDate, postUrl, dateFormatInUrl, urlWithExtension) {
    let url = '';
    if (dateFormatInUrl !== undefined) {
      url += momentDate.format(config.dateFormatInUrl) + '/';
    }

    if (postUrl) {
      url += postUrl;
    } else {
      url += postName;
    }

    if (urlWithExtension) {
      url += '.html';
    }

    return url;
  }

  // Create locals must create URLs
  function createLocals(posts, { createStyles, createScripts }, deps) {
    return posts.map((post) => {
      const styles = createStyles(config.styles, post.meta, deps.styles.object);
      const scripts = createScripts(config.scripts, post.meta, deps.scripts.object);

      // TODO: almost the same as page -> maybe some stuff can be externalized
      const momentDate = moment(post.meta.date);
      const url = createURL(post.fileName, momentDate, post.meta.url, config.dateFormatInUrl, config.urlWithExtension);
      const meta = Object.assign({}, post.meta);
      const content = Object.assign({}, post.content);

      return Object.assign(
          {},
          {
            content,
            styles,
            scripts,
          }, {meta: Object.assign({}, meta, {
            meta: {
              url, momentDate
            },
          })
          }
      );
    });
  }

  function process(postsWithLocals, { renderTemplate }) {
    return genericContentProcessor.process(postsWithLocals, 'posts', renderTemplate, config);
  }

  function postprocess(posts) {
    return genericContentProcessor.postprocess(posts, config);
  }

  function write(posts, { writers }) {
    genericContentProcessor.write(posts, writers, config);
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
const name = 'posts';
const dependsOn = {
  assets: ['scripts', 'styles'],
  contents: []
};
function registration(register) {
  register(type, name, dependsOn, init);
}
module.exports = registration;
