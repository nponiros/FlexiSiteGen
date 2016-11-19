'use strict';

function init({
    fileProcessors,
}) {
  return function registerFileProcessor(name, extensions, processor) {
    const fileProcessor = {
      extensions,
      process: processor.process,
      minify: processor.minify,
    };
    fileProcessors.set(name, fileProcessor);
  };
}

module.exports = init;
