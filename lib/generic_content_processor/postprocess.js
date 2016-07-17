'use strict';

const minify = require('html-minifier').minify;

function postprocess(contents, config) {
  if (config.productionMode) {
    return contents.map((content) => {
      content.contentsToWrite = minify(content.contentsToWrite, config.htmlmin);
      return content;
    });
  } else {
    return contents;
  }
}

module.exports = postprocess;
