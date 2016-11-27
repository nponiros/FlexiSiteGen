'use strict';

const path = require('path');

// defaultOpts -> configured in generator config
function init(fileProcessors, defaultOpts, helpers) {
  function processFile(filePath, fileContents, opts) {
    const extension = path.extname(filePath);
    for (const [processorName, processor] of fileProcessors.entries()) {
      const extIndex = processor.extensions.indexOf(extension);
      if (extIndex !== -1) {
        const mergedOptions = Object.assign({}, defaultOpts.global, defaultOpts[processorName], opts);
        return processor.process(fileContents, mergedOptions, helpers);
      }
    }
    throw new Error(`No file processor found for extension: ${extension}. Given file: ${filePath}`);
  }

  // Offer direct access to individual processors
  for (const [name, fn] of fileProcessors.entries()) {
    processFile[name] = fn.process;
  }

  return processFile;
}

module.exports = init;
