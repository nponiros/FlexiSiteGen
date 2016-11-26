'use strict';

const path = require('path');


function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}) {
  const config = Object.assign({}, globalConfig, processorGlobalConfig, processorConfig);

  function read(basePath, { readers }) {
    const fontPaths = readers.dir(`${basePath}`);
    const fonts = fontPaths.map((fontPath) => {
      return {
        name: path.basename(fontPath),
        path: fontPath
      };
    });
    return fonts;
  }

// font has name and path
  function preprocess(fonts) {
    return fonts.map((font) => {
      const next = Object.assign({}, font);
      next.writePath = `./fonts/${font.name}`;
      return next;
    });
  }

// font has name, path and writePath
  function templateVariables(fonts) {
    return fonts.map((font) => {
      const next = Object.assign({}, font);
      next.writePath = `fonts/${font.name}`;
      return next;
    });
  }

// font has name, path and writePath
  function write(fonts, { writers }) {
    fonts.forEach((font) => {
      writers.copy(font.path, `${config.outputDir}/${font.writePath}`);
    });
  }

  return {
    read,
    preprocess,
    templateVariables,
    write
  };
}

const type = 'asset';
const name = 'fonts';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
