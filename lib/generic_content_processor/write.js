'use strict';

function write(contents, writers, config) {
  contents.forEach((content) => {
    writers.file(`${config.outputDir}/${content.writePath}`, content.contentsToWrite);
  });
}

module.exports = write;
