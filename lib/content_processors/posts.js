'use strict';

const path = require('path');
const moment = require('moment');

const minify = require('html-minifier').minify;

function init(processorOpts, globalProcessorOpts, globalOpts) {
  const config = Object.assign({}, globalOpts, globalProcessorOpts, processorOpts);

  function read(basePath, readers) {
    const postPaths = readers.dir(basePath);

    const posts = postPaths.map((postPath) => {
      if (readers.isDir(postPath)) {
        const directoryName = path.basename(postPath);
        const pageFiles = readers.dir(postPath);
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
        const extension = path.extname(postPath);
        const fileName = path.basename(postPath, extension);
        return {
          isDirectory: false,
          fileName,
          filePath: postPath,
          stringContent: readers.fileToString(postPath)
        };
      }
    });

    return posts;
  }

  // If post in directory need some meta
  // if post a file use front-matter
  function preprocess(posts, processFile) {
    return posts.map((post) => {
      if (post.isDirectory) {
        const metaAndContent = post.files.map((file) => {
          // Return is a string if we deal with content or a object if we deal with meta
          return {
            fileName: file.fileName,
            content: processFile(file.filePath, file.stringContent, {isDirectory: post.isDirectory})
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
            {fileName: post.fileName},
            metaAndContent
        );
      } else {
        // Return is an object with {meta, content}
        // content is {content} or {section1, section2}
        return Object.assign(
            {},
            {fileName: post.fileName},
            processFile(post.filePath, post.stringContent, post.isDirectory)
        );
      }
    });
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

  // TODO: or here could filter scripts
  // Create locals must create URLs
  function createLocals(posts) {
    return posts.map((post) => {
      const url = createURL(post.fileName, momentDate, post.meta.url, config.dateFormatInUrl, config.urlWithExtension);
      return Object.assign(
          {},
          {
            meta: post.meta,
            content: post.content
          }, {
            meta: {
              url,
              momentDate
            }
          }
      );
    });
  }

  // TODO: could filter scripts here and change the locals
  function process(postsWithLocals, renderTemplate) {
    return postsWithLocals.map((post) => {
      // current is the current page
      // locals contains all pages/posts other content types, site config
      const locals = postsWithLocals.locals;
      locals.current = {
        meta: post.meta,
        content: post.content
      };
      const next = Object.assign({}, post);
      next.writePath = `${post.meta.url}${config.urlWithExtension ? '' : '.html'}`;
      next.contentsToWrite = renderTemplate(post.meta.template || config.template, locals);
      return next;
    });
  }

  // TODO: could add cache busting here
  function postprocess(posts) {
    if (config.productionMode) {
      return posts.map((post) => {
        post.contentsToWrite = minify(post.contentsToWrite, config.htmlmin);
        return post;
      });
    } else {
      return posts;
    }
  }

  function write(posts, writers) {
    posts.forEach((post) => {
      writers.file(`${config.outputDir}/${post.writePath}`, post.contentsToWrite);
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
const name = 'posts';
const dependsOn = {
  assets: [],
  contents: []
};
function registration(register) {
  register(type, name, dependsOn, init);
}
module.exports = registration;
