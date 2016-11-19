'use strict';

function init({
    fileProcessors,
}) {
  return function registerFileProcessor(name, extensions, processorFn) {
    const fileProcessor = {
      extensions,
      process: processorFn,
    };
    fileProcessors.set(name, fileProcessor);
  };
}

module.exports = init;
