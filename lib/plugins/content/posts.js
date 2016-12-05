'use strict';

const moment = require('moment');
const update = require('immutability-helper');

const extendify = require('extendify');
const extend = extendify({
  inPlace: false,
  arrays: 'concat',
});

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig,
}) {
  const config = extend(globalConfig, processorGlobalConfig, processorConfig);

  function read(basePath, { readers, processContent }) {
    return processContent.read(basePath, readers);
  }

  function preprocess(posts, { processFile, processContent }) {
    return processContent.preprocess(posts, processFile);
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

  // Create templateVariables must create URLs
  function templateVariables(posts, { createStyles, createScripts }, db) {
    return posts.map((post) => {
      const styles = createStyles(config.styles, post.meta, db.get('templateVariables').styles.object);
      const scripts = createScripts(config.scripts, post.meta, db.get('templateVariables').scripts.object);

      const momentDate = moment(post.meta.date, config.dateFormat);
      const url = createURL(post.fileName, momentDate, post.meta.url, config.dateFormatInUrl, config.urlWithExtension);
      const meta = Object.assign({}, post.meta);
      const content = Object.assign({}, post.content);

      return Object.assign(
          {},
          { id: post.id, content, styles, scripts }, {
            meta: update(meta, { $merge: { url, momentDate } }),
          });
    });
  }

  function process(postsWithLocals, { renderTemplate, processContent }, db) {
    return processContent.process(postsWithLocals, 'posts', renderTemplate, config, db);
  }

  function postprocess(posts, { processContent }) {
    return processContent.postprocess(posts, config);
  }

  function write(posts, { writers, processContent }) {
    processContent.write(posts, writers, config);
  }

  return {
    read,
    preprocess,
    templateVariables,
    process,
    postprocess,
    write,
  };
}

const type = 'content';
const name = 'posts';
function registration(register) {
  register(type, name, init);
}
module.exports = registration;
