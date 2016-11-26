'use strict';

const path = require('path');

const CleanCSS = require('clean-css');

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}) {
  const config = Object.assign({}, globalConfig, processorGlobalConfig, processorConfig);

  function read(basePath, { readers }) {
    const stylePaths = readers.dir(`${basePath}`);
    const styles = stylePaths.map((stylePath) => {
      return {
        id: path.basename(stylePath),
        name: path.basename(stylePath),
        isBundle: false,
        contents: readers.fileToString(stylePath)
      };
    });
    const bundles = config.bundles ? config.bundles.map((bundle) => {
      return {
        id: bundle.name,
        name: bundle.name,
        isBundle: true,
        files: bundle.files
      }
    }) : [];
    return [...styles, ...bundles];
  }

  function preprocess(styles) {
    return styles.map((style) => {
      const next = Object.assign({}, style);
      next.writePath = `styles/${style.name}`;
      return next;
    });
  }

  function templateVariables(styles) {
    return styles.map((style) => {
      const next = Object.assign({}, style);
      next.url = `/styles/${style.name}`;
      return next;
    });
  }

  function postprocess(styles) {
    return styles.map((style) => {
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

  function write(styles, { writers }) {
    styles.forEach((style) => {
      writers.file(`${config.outputDir}/${style.writePath}`, style.contents);
    });
  }

  return {
    read,
    preprocess,
    templateVariables,
    postprocess,
    write
  };
}

const type = 'asset';
const name = 'styles';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
