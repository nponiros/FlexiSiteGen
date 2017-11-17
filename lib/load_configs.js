'use strict';

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

function loadConfigs(basePath, { isProd, cacheBust }) {
  const userConfig = yaml.safeLoad(readFileToString(`${basePath}/generator_config.yml`));
  const generatorConfig = extend({}, defaultConfig, userConfig);
  const commonConfig = Object.assign({ basePath }, extend(defaultConfig.common, generatorConfig.common));
  const externalPluginPaths = generatorConfig.plugins || {};

  // Add prod mode
  commonConfig.productionMode = isProd;
  // Add cachebust mode
  commonConfig.cacheBust = cacheBust;

  return {
    generatorConfig,
    externalPluginPaths,
    commonConfig,
  };
}

module.exports = loadConfigs;
