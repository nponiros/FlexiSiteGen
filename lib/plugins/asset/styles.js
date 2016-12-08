'use strict';

const path = require('path');

const postcss = require('postcss');

function init({
    processorConfig,
    processorCommonConfig,
    commonConfig,
}) {
  const config = Object.assign({}, commonConfig, processorCommonConfig, processorConfig);

  function read(basePath, { readers }) {
    const stylePaths = readers.dir(`${basePath}`);
    const styles = stylePaths.map((stylePath) => {
      return {
        id: path.basename(stylePath),
        name: path.basename(stylePath),
        isBundle: false,
        contents: readers.fileToString(stylePath),
      };
    });
    const bundles = config.bundles ? config.bundles.map((bundle) => {
      return {
        id: bundle.name,
        name: bundle.name,
        isBundle: true,
        files: bundle.files,
      };
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
    return Promise.all(styles.map((style) => {
      if (style.isBundle) {
        style.contents = style.files.reduce((s, fileName) => {
          return s + styles.object[fileName].contents;
        }, '');
      }
      if (config.productionMode) {
        return postcss(config.postcssPlugins.prod.map((pluginName) => require(pluginName)))
            .process(style.contents)
            .then((result) => {
              result.writePath = style.writePath;
              return result;
            });
      }

      return postcss(config.postcssPlugins.dev.map((pluginName) => require(pluginName)))
          .process(style.contents)
          .then((result) => {
            result.writePath = style.writePath;
            return result;
          });
    }));
  }

  function write(styles, { writers }) {
    styles.forEach((style) => {
      writers.file(`${config.outputDir}/${style.writePath}`, style.css);
    });
  }

  return {
    read,
    preprocess,
    templateVariables,
    postprocess,
    write,
  };
}

const type = 'asset';
const name = 'styles';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
