'use strict';

const path = require('path');

const CleanCSS = require('clean-css');

function init(processorOpts, globalProcessorOpts, globalOpts) {
  const config = Object.assign({}, globalOpts, globalProcessorOpts, processorOpts);

  function read(basePath, readers) {
    const stylePaths = readers.dir(`${basePath}`);
    const styles = stylePaths.map((stylePath) => {
      return {
        name: path.basename(stylePath),
        path: stylePath,
        contents: readers.fileToString(stylePath)
      };
    });
    return styles;
  }

// style has name, path
  function preprocess(styles) {
    return styles.map((style) => {
      const next = Object.assign({}, style);
      next.writePath = `styles/${style.name}`;
      return next;
    });
  }

// style has name, path, writePath
  function createLocals(styles) {
    return styles.map((style) => {
      const next = Object.assign({}, style);
      next.url = `/styles/${style.name}`;
      return next;
    });
  }

// style has name, path, writePath
  function postprocess(styles) {
    if (config.productionMode) {
      return styles.map((style) => {
        style.contents = new CleanCSS(config.minify).minify(style.contents).styles;
        return style;
      });
    } else {
      return styles;
    }
  }

// style has name, path, writePath
  function write(styles, writer) {
    styles.forEach((style) => {
      writer.file(`${config.outputDir}/${style.writePath}`, style.contents);
    });
  }

  const processor = {
    read,
    preprocess,
    createLocals,
    postprocess,
    write
  };
  return processor;
}

const type = 'asset';
const name = 'styles';
const dependsOn = undefined;
function registration(register) {
  register(type, name, dependsOn, init);
}

module.exports = registration;
