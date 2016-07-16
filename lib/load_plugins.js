'use strict';

const path = require('path');

function loadPlugins(basePath, internalPluginPaths, externalPluginPaths) {
  const normalizedExternalPluginPaths = externalPluginPaths.map((pluginPath) => path.resolve(basePath, pluginPath));
  const pluginPaths = [
    ...normalizedExternalPluginPaths,
    ...internalPluginPaths
  ];

  const plugins = pluginPaths.map((p) => {
    return require(p);
  });
  return plugins;
}

module.exports = loadPlugins;
