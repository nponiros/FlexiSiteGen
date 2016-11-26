'use strict';

const update = require('immutability-helper');
const path = require('path');

const fs = require('fs');
const yaml = require('js-yaml');

const extendify = require('extendify');
const extend = extendify({
  inPlace: false,
  arrays: 'replace',
});

const defaultConfig = require('./default_config');

function readFileToString(path, opts) {
  opts = opts || { encoding: 'utf8' };
  return fs.readFileSync(path, opts);
}

function normalizePostcssPluginPaths(basePath, pluginNames) {
  return pluginNames.map((pluginName) => {
    if (pluginName === 'cssnano') {
      return pluginName;
    }
    return path.resolve(basePath, 'node_modules', pluginName);
  });
}

function loadConfigs(basePath, isProd) {
  const userConfig = yaml.safeLoad(readFileToString(`${basePath}/generator_config.yml`, {}));
  const generatorConfig = extend({}, defaultConfig, userConfig);
  const globalConfig = extend(defaultConfig.global, generatorConfig.global);
  const externalPluginPaths = generatorConfig.plugins || {};

  const postcssPlugins = {
    dev: normalizePostcssPluginPaths(basePath, generatorConfig.asset.styles.postcssPlugins.dev),
    prod: normalizePostcssPluginPaths(basePath, generatorConfig.asset.styles.postcssPlugins.prod),
  };

  // Add prod mode
  if (isProd !== undefined) {
    globalConfig.productionMode = isProd;
  }

  return {
    generatorConfig: update(generatorConfig, { asset: { styles: { postcssPlugins: { $set: postcssPlugins } } } }),
    externalPluginPaths,
    globalConfig,
  };
}

module.exports = loadConfigs;
