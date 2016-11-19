'use strict';

const path = require('path');

function loadPlugins(basePath, internalPluginPaths, externalPluginPaths) {
  const normalizedExternalPluginPaths = externalPluginPaths
      .map((pluginPath) => path.resolve(basePath, pluginPath));
  const pluginPaths = [
    ...normalizedExternalPluginPaths,
    ...internalPluginPaths
  ];

  return pluginPaths.map((p) => {
    return require(p);
  });
}

module.exports = loadPlugins;
