'use strict';

const path = require('path');

function init({
    processorConfig,
    processorCommonConfig,
    commonConfig,
}) {
  const config = Object.assign({}, commonConfig, processorCommonConfig, processorConfig);

  function read(basePath, { readers }) {
    const fontPaths = readers.dirRecursive(`${basePath}`);
    return fontPaths.map((fontPath) => {
      return {
        id: path.basename(fontPath),
        name: path.basename(fontPath),
        path: fontPath.replace(basePath, '').replace(path.basename(fontPath), ''),
      };
    });
  }

// font has name and path
  function preprocess(fonts) {
    return fonts.map((font) => {
      const next = Object.assign({}, font);
      next.writePath = path.join('fonts', font.path, font.name);
      return next;
    });
  }

// font has name, path and writePath
  function write(fonts, { writers }) {
    fonts.forEach((font) => {
      writers.copy(
        path.join(config.basePath, config.path, 'fonts', font.path, font.name),
        `${config.outputDir}/${font.writePath}`
      );
    });
  }

  return {
    read,
    preprocess,
    write,
  };
}

const type = 'asset';
const name = 'fonts';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
