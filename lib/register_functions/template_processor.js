'use strict';

function init({
  templateProcessors,
}) {
  return function registerTemplateProcessor(name, extensions, processFn) {
    const templateProcessor = {
      extensions,
      process: processFn,
    };
    templateProcessors.set(name, templateProcessor);
  };
}

module.exports = init;
