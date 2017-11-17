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
        stylePath,
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

  function normalizePostcssPluginPath(basePath, pluginName) {
    return path.resolve(basePath, 'node_modules', pluginName);
  }

  function normalizePostcssPluginPaths(basePath, plugins) {
    return plugins.map((plugin) => {
      if (plugin.name === 'cssnano') {
        return plugin;
      }
      return Object.assign({}, plugin, { name: normalizePostcssPluginPath(basePath, plugin.name) });
    });
  }

  function loadPostcssPlugins(plugins) {
    return plugins.map((plugin) => {
      const loadedPlugin = require(plugin.name);
      if (plugin.opts) {
        return loadedPlugin(plugin.opts);
      }
      return loadedPlugin;
    });
  }

  function preparePostcssOptions(opts = {}, basePath) {
    const postcssOptions = {};

    if (opts.parser) {
      postcssOptions.parser = require(normalizePostcssPluginPath(basePath, opts.parser));
    }

    if (opts.syntax) {
      postcssOptions.syntax = require(normalizePostcssPluginPath(basePath, opts.syntax));
    }

    if (opts.stringifier) {
      postcssOptions.stringifier = require(normalizePostcssPluginPaths(basePath, opts.stringifier));
    }

    return postcssOptions;
  }

  function preprocess(styles, helperFunctions, db) {
    const postcssPlugins = config.productionMode ? config.postcss.plugins.prod : config.postcss.plugins.dev;
    const postcssNormalizedPlugins = normalizePostcssPluginPaths(db.get('basePath'), postcssPlugins);
    const postcssLoadedPlugins = loadPostcssPlugins(postcssNormalizedPlugins);

    const postcssOptions = preparePostcssOptions(config.postcss.opts, db.get('basePath'));

    const bundles = [];
    const postprocessResults = {};

    const promises = styles // Ignore bundles for now
      .filter((style) => {
        if (style.isBundle) {
          bundles.push(style);
          return false;
        }
        return true;
      }) // postprocess all real files
      .map((style) => {
        return postcss(postcssLoadedPlugins)
          .process(style.contents, Object.assign(postcssOptions, { from: style.stylePath }))
          .then((result) => {
            result.writePath = style.writePath;
            result.name = style.name;
            result.id = style.id;
            postprocessResults[style.name] = result;
            return result;
          });
      });
    return Promise
      .all(promises)
      .then((results) => { // Now get bundle contents from the postprocess results
        const postprocessedBundles = bundles.map((bundle) => {
          bundle.css = bundle.files.reduce((s, fileName) => {
            return s + postprocessResults[fileName].css;
          }, '');
          return bundle;
        });

        return [...results, ...postprocessedBundles]
          .map((style) => {
            const next = Object.assign({}, style);

            if (config.cacheBust) {
              const fingerprintOpts = { env: config.productionMode ? 'production' : 'dev' };
              const filename = helperFunctions.fingerprint(style.name, style.css, fingerprintOpts).file;
              next.writePath = `styles/${path.basename(style.name, '.css')}-${filename}`;
            } else {
              next.writePath = `styles/${style.name}`;
            }
            return next;
          });
      });
  }

  function templateVariables(styles) {
    return styles.map((style) => {
      const next = Object.assign({}, style);
      next.url = '/' + style.writePath;
      return next;
    });
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
    write,
  };
}

const type = 'asset';
const name = 'styles';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
