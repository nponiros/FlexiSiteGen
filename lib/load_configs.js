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

function readFileToString(path) {
  return fs.readFileSync(path, { encoding: 'utf8' });
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
  const userConfig = yaml.safeLoad(readFileToString(`${basePath}/generator_config.yml`));
  const generatorConfig = extend({}, defaultConfig, userConfig);
  const commonConfig = Object.assign({ basePath }, extend(defaultConfig.common, generatorConfig.common));
  const externalPluginPaths = generatorConfig.plugins || {};

  const postcssPlugins = {
    dev: normalizePostcssPluginPaths(basePath, generatorConfig.asset.styles.postcssPlugins.dev),
    prod: normalizePostcssPluginPaths(basePath, generatorConfig.asset.styles.postcssPlugins.prod),
  };

  // Add prod mode
  commonConfig.productionMode = isProd;

  return {
    generatorConfig: update(generatorConfig, { asset: { styles: { postcssPlugins: { $set: postcssPlugins } } } }),
    externalPluginPaths,
    commonConfig,
  };
}

module.exports = loadConfigs;
