'use strict';

const path = require('path');


function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}) {
  const config = Object.assign({}, globalConfig, processorGlobalConfig, processorConfig);

  function read(basePath, readers) {
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
  function createLocals(fonts) {
    return fonts.map((font) => {
      const next = Object.assign({}, font);
      next.writePath = `fonts/${font.name}`;
      return next;
    });
  }

// font has name, path and writePath
  function write(fonts, writer) {
    fonts.forEach((font) => {
      writer.copy(font.path, `${config.outputDir}/${font.writePath}`);
    });
  }

  const processor = {
    read,
    preprocess,
    createLocals,
    write
  };
  return processor;
}

const type = 'asset';
const name = 'fonts';
const dependsOn = undefined;
function registration(register) {
  register(type, name, dependsOn, init);
}

module.exports = registration;
