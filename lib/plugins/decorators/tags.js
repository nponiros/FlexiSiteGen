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
      // TODO: we change a reference here. This is not so good
      post.meta.tags = post.meta.tags.map((tag) => {
        if (tagsLocal[tag]) { // Used in a tags list to display all tags
          tagsLocal[tag].posts.push(post);
        } else {
          tagsLocal[tag] = {
            label: tag,
            url: `tags#${tag.replace(' ', '-')}`,
            id: tag.replace(' ', '-'),
            posts: [post]
          };
        }
        return { // Replace the tag string of the post with an object
          label: tag,
          url: `tags#${tag.replace(' ', '-')}`
        };
      });
    });
    return Object.keys(tagsLocal).map((key) => tagsLocal[key]);
  }

  function process(tagsWithLocals, { renderTemplate }) {
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

  function write(tags, { writers }) {
    writers.file(`${config.outputDir}/${tags.writePath}.html`, tags.contentsToWrite);
  }

  return {
    read,
    createLocals,
   // process,
   // postprocess,
   // write
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
