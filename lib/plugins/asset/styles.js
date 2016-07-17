'use strict';

const path = require('path');

const CleanCSS = require('clean-css');

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}) {
  const config = Object.assign({}, globalConfig, processorGlobalConfig, processorConfig);

  function read(basePath, readers) {
    const stylePaths = readers.dir(`${basePath}`);
    const styles = stylePaths.map((stylePath) => {
      return {
        name: path.basename(stylePath),
        isBundle: false,
        contents: readers.fileToString(stylePath)
      };
    });
    const bundles = config.bundles ? config.bundles.map((bundle) => {
      return {
        name: bundle.name,
        isBundle: true,
        files: bundle.files
      }
    }) : [];
    return [...styles, ...bundles];
  }

  function preprocess(styles) {
    const array = styles.map((style) => {
      const next = Object.assign({}, style);
      next.writePath = `styles/${style.name}`;
      return next;
    });
    const object = styles.reduce((map, style) => Object.assign({}, map, {[style.name]: style}), {});
    return {
      array,
      object
    };
  }

  function createLocals(styles) {
    const styleLocals = styles.array.map((style) => {
      const next = Object.assign({}, style);
      next.url = `/styles/${style.name}`;
      styles.object[style.name].url = next.url;
      return next;
    });
    return {
      array: styleLocals,
      object: styles.object
    };
  }

  function postprocess(styles) {
    return styles.array.map((style) => {
      if (style.isBundle) {
        style.contents = style.files.reduce((s, fileName) => {
          return s + styles.object[fileName].contents;
        }, '');
      }
      if (config.productionMode) {
        style.contents = new CleanCSS(config.minify).minify(style.contents).styles;
      }
      return style;
    });
  }

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
