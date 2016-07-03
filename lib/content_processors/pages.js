'use strict';

const path = require('path');

const minify = require('html-minifier').minify;

function init(processorOpts, globalProcessorOpts, globalOpts) {
  const config = Object.assign({}, globalOpts, globalProcessorOpts, processorOpts);

  function read(basePath, readers) {
    const pagesPaths = readers.dir(basePath);

    const pages = pagesPaths.map((pagePath) => {
      if (readers.isDir(pagePath)) {
        const directoryName = path.basename(pagePath);
        const pageFiles = readers.dir(pagePath);
        const files = pageFiles.map((file) => {
          const extension = path.extname(file);
          const fileName = path.basename(file, extension);
          return {
            fileName: fileName,
            filePath: file,
            stringContent: readers.fileToString(file)
          }
        });
        return {
          isDirectory: true,
          fileName: directoryName,
          files
        };
      } else {
        const extension = path.extname(pagePath);
        const fileName = path.basename(pagePath, extension);
        return {
          isDirectory: false,
          fileName,
          filePath: pagePath,
          stringContent: readers.fileToString(pagePath)
        };
      }
    });

    return pages;
  }

  // If page in directory need some meta
  // if page a file use front-matter
  function preprocess(pages, processFile) {
    return pages.map((page) => {
      if (page.isDirectory) {
        const metaAndContent = page.files.map((file) => {
          // Return is a string if we deal with content or a object if we deal with meta
          return {
            fileName: file.fileName,
            content: processFile(file.filePath, file.stringContent, {isDirectory: page.isDirectory})
          };
        }).reduce((map, cur) => {
          // If string we have content
          // If object we have meta
          if (typeof cur.content === 'string') {
            return Object.assign({}, map, {content: {[cur.fileName]: cur.content}});
          } else {
            return Object.assign({}, map, {meta: cur.content});
          }
        }, {
          meta: {},
          content: {}
        });
        return Object.assign(
            {},
            {fileName: page.fileName},
            metaAndContent
        );
      } else {
        // Return is an object with {meta, content}
        // content is {content} or {section1, section2}
        return Object.assign(
            {},
            {fileName: page.fileName},
            processFile(page.filePath, page.stringContent, page.isDirectory)
        );
      }
    });
  }

  function createLocals(pages) {
    return pages.map((page) => {
      return Object.assign(
          {},
          {
            meta: page.meta,
            content: page.content
          }, {
            meta: {
              url: `${page.meta.url || page.fileName}${config.urlWithExtension ? '.html' : ''}`
            }
          }
      );
    });
  }

  function process(pagesWithLocals, renderTemplate) {
    return pagesWithLocals.map((page) => {
      // current is the current page
      // locals contains all pages/posts other content types, site config
      const locals = pagesWithLocals.locals;
      locals.current = page;
      const next = Object.assign({}, page);
      next.writePath = `${page.meta.url}${config.urlWithExtension ? '' : '.html'}`;
      next.contentsToWrite = renderTemplate(page.meta.template || config.template, locals);
      return next;
    });
  }

  function postprocess(pages) {
    if (config.productionMode) {
      return pages.map((page) => {
        page.contentsToWrite = minify(page.contentsToWrite, config.htmlmin);
        return page;
      });
    } else {
      return pages;
    }
  }

  function write(pages, writers) {
    pages.forEach((page) => {
      writers.file(`${config.outputDir}/${page.writePath}`, page.contentsToWrite);
    });
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
  assets: [],
  contents: []
};
function registration(register) {
  register(type, name, dependsOn, init);
}
module.exports = registration;
