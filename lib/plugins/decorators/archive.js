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

  function createLocals(archive, fns, dependencies) {
    const archiveLocalObject = {};

    // TODO: sort the arrays
    // TODO: label for month should be the month in text
    dependencies.posts.forEach((post) => {
      const momentDate = post.meta.momentDate;
      const year = momentDate.year();
      const month = momentDate.month();
      if (archiveLocalObject[year]) {
        if (archiveLocalObject[year][month]) {
          archiveLocalObject[year][month].posts.push(post);
        } else {
          archiveLocalObject[year][month] = {
            posts: [post]
          };
        }
      } else {
        archiveLocalObject[year] = {};
        archiveLocalObject[year][month] = {
          posts: [post]
        };
      }
    });

    const archiveLocalArray = [];
    for (let year in archiveLocalObject) {
      if (archiveLocalObject.hasOwnProperty(year)) {
        const archiveYear = {
          label: year,
          months: []
        };

        for (let month in archiveLocalObject[year]) {
          if (archiveLocalObject[year].hasOwnProperty(month)) {
            archiveYear.months.push({
              label: month,
              posts: archiveLocalObject[year][month].posts
            });
          }
        }

        archiveLocalArray.push(archiveYear);
      }
    }

    return archiveLocalArray;
  }

  function process(archiveWithLocals, renderTemplate) {
    const next = {};
    next.writePath = 'archive';
    next.contentsToWrite = renderTemplate(config.template, archiveWithLocals.locals);
    return next;
  }

  function postprocess(archive) {
    if (config.productionMode) {
      archive.contentsToWrite = minify(archive.contentsToWrite, config.htmlmin);
      return archive;
    } else {
      return archive;
    }
  }

  function write(archive, writers) {
    writers.file(`${config.outputDir}/${archive.writePath}.html`, archive.contentsToWrite);
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
const name = 'archive';
const dependsOn = {
  assets: [],
  contents: ['posts']
};
function registration(register) {
  register(type, name, dependsOn, init);
}
module.exports = registration;
