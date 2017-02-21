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
    processorCommonConfig,
    commonConfig,
}) {
  const config = extend(commonConfig, processorCommonConfig, processorConfig);

  function read(basePath, { readers, processContent }) {
    return processContent.read(basePath, readers);
  }

  function preprocess(posts, { processFile, processContent }) {
    // Sort posts based on date with newest date first
    function sortFn(a, b) {
      const momentDateA = moment(a.meta.date, config.dateFormat);
      const momentDateB = moment(b.meta.date, config.dateFormat);
      if (momentDateA.isBefore(momentDateB)) {
        return 1;
      } else if (momentDateA.isAfter(momentDateB)) {
        return -1;
      }
      return 0;
    }
    return processContent.preprocess(posts, processFile).sort(sortFn);
  }

  function pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  function createURL(postName, momentDate, postUrl, urlFormat, urlWithExtension) {
    let url = '';
    if (urlFormat) {
      const splitted = urlFormat.split('/');
      const needsReplacing = splitted.map((i) => /\$\{(.*)\}/.test(i));
      url = splitted.map((i, index) => {
        if (needsReplacing[index]) {
          const matched = i.match(/\$\{(.*)\}/)[1];
          if (matched === 'month') {
            return pad(momentDate[matched]() + 1);
          }
          return pad(momentDate[matched]());
        }
        return i;
      }).join('/');
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
      let styles = [];
      let scripts = [];
      if (db.get('templateVariables').styles) {
        styles = createStyles(config.styles, post.meta, db.get('templateVariables').styles.object);
      }
      if (db.get('templateVariables').scripts) {
        scripts = createScripts(config.scripts, post.meta, db.get('templateVariables').scripts.object);
      }

      const momentDate = moment(post.meta.date, config.dateFormat);
      const url = createURL(post.fileName, momentDate, post.meta.url, config.urlFormat, config.urlWithExtension);
      const meta = Object.assign({}, config.meta, post.meta);
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
