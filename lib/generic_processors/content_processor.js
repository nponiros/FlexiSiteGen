'use strict';

const path = require('path');
const update = require('immutability-helper');
const minify = require('html-minifier').minify;

function read(basePath, readers) {
  const contentPaths = readers.dir(basePath);

  return contentPaths.map((contentPath) => {
    if (readers.isDir(contentPath)) {
      const directoryName = path.basename(contentPath);
      const contentFiles = readers.dir(contentPath);
      const files = contentFiles.map((file) => {
        const extension = path.extname(file);
        const fileName = path.basename(file, extension);
        return {
          fileName,
          filePath: file,
          stringContent: readers.fileToString(file),
        };
      });
      return {
        id: directoryName,
        isDirectory: true,
        fileName: directoryName,
        files,
      };
    }
    const extension = path.extname(contentPath);
    const fileName = path.basename(contentPath, extension);
    return {
      id: fileName,
      isDirectory: false,
      fileName,
      filePath: contentPath,
      stringContent: readers.fileToString(contentPath),
    };
  });
}

function preprocess(contents, processFile) {
  return contents.map((content) => {
    if (content.isDirectory) {
      const metaAndContent = content.files
          .map((file) => {
            // Return is a string if we deal with content or an object if we deal with meta
            return {
              id: file.fileName,
              fileName: file.fileName,
              content: processFile(file.filePath, file.stringContent, { isDirectory: content.isDirectory }),
            };
          })
          .reduce((map, cur) => {
            // If string we have content
            // If object we have meta
            // cur.content is the file content read in map above
            if (typeof cur.content === 'string') {
              return update(map, { content: { $merge: { [cur.fileName]: cur.content } } });
            }
            return update(map, { meta: { $set: cur.content } });
          }, {
            meta: {},
            content: {},
          });
      return Object.assign(
          {},
          { id: content.id, fileName: content.fileName },
          metaAndContent
      );
    }
    // Return is an object with {meta, content}
    // content is {content} or {section1, section2}
    return Object.assign(
        {},
        { fileName: content.fileName },
        processFile(content.filePath, content.stringContent, content.isDirectory)
    );
  });
}

function process(contentWithLocals, contentType, renderTemplate, config, db) {
  return db.get('templateVariables')[contentType].map((current, i) => {
    const page = contentWithLocals[i];
    // current are the templateVariables for the current page
    // templateVariables contains all pages/posts other content types etc.
    const templateVariables = Object.assign({}, db.get('templateVariables'), { current });
    const writePath = `${current.meta.url}${config.urlWithExtension ? '' : '.html'}`;
    const contentsToWrite = renderTemplate(current.meta.template || config.template, templateVariables);
    return Object.assign({}, page, { writePath, contentsToWrite });
  });
}

function postprocess(contents, config) {
  if (config.productionMode) {
    return contents.map((content) => {
      content.contentsToWrite = minify(content.contentsToWrite, config.htmlmin);
      return content;
    });
  }
  return contents;
}

function write(contents, writers, config) {
  contents.forEach((content) => {
    writers.file(`${config.outputDir}/${content.writePath}`, content.contentsToWrite);
  });
}

module.exports = {
  read,
  preprocess,
  process,
  postprocess,
  write,
};
