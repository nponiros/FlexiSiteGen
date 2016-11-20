'use strict';

const path = require('path');

// TODO use constants for type
function loadPlugins(basePath, internalPlugins, externalPlugins) {
  const externalPluginsPathsNormalized = Object.keys(externalPlugins)
    .reduce((map, cur) => Object.assign({}, map,
        { [cur]: externalPlugins[cur].map((p) => path.resolve(basePath, p)) }),
        {}
    );

  const pluginPaths = [
    ...internalPlugins.asset, ...(externalPluginsPathsNormalized.asset || []),
    ...internalPlugins.content, ...(externalPluginsPathsNormalized.content || []),
    ...internalPlugins.decorator, ...(externalPluginsPathsNormalized.decorator || []),
    ...internalPlugins.helpers, ...(externalPluginsPathsNormalized.helpers || []),
    ...internalPlugins.template, ...(externalPluginsPathsNormalized.template || []),
    ...internalPlugins.file, ...(externalPluginsPathsNormalized.file || []),
  ];

  return pluginPaths.map((p) => {
    return require(p);
  });
}

module.exports = loadPlugins;
