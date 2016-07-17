'use strict';

// scripts are the local scripts from the asset processor
function createLocalScripts(configScripts, contentMeta, scripts) {
  // Scripts defined for this resource
  const contentScripts = [...configScripts, ...(contentMeta.scripts || [])];
  return contentScripts.map((script) => ({
    url: scripts[script.name].url,
    opts: script.opts
  }));
}

module.exports = createLocalScripts;
