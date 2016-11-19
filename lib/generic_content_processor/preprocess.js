'use strict';
const update = require('immutability-helper');

function preprocess(contents, processFile) {
  return contents.map((content) => {
    if (content.isDirectory) {
      const metaAndContent = content.files.map((file) => {
        // Return is a string if we deal with content or a object if we deal with meta
        return {
          fileName: file.fileName,
          content: processFile(file.filePath, file.stringContent, {isDirectory: content.isDirectory})
        };
      }).reduce((map, cur) => {
        // If string we have content
        // If object we have meta
        if (typeof cur.content === 'string') {
          return update(map, { content: { $merge: { [cur.fileName]: cur.content }}});
        } else {
          return Object.assign({}, map, {meta: cur.content});
        }
      }, {
        meta: {},
        content: {}
      });
      return Object.assign(
          {},
          {fileName: content.fileName},
          metaAndContent
      );
    } else {
      // Return is an object with {meta, content}
      // content is {content} or {section1, section2}
      return Object.assign(
          {},
          {fileName: content.fileName},
          processFile(content.filePath, content.stringContent, content.isDirectory)
      );
    }
  });
}

module.exports = preprocess;
