'use strict';

function init() {
// scripts are the local scripts from the asset processor
function createLocalScripts(configScripts, contentMeta, scripts) {
  // Scripts defined for this resource
  const contentScripts = [...configScripts, ...(contentMeta.scripts || [])];
  return contentScripts.map((script) => ({
    url: scripts[script.name].url,
    opts: script.opts
  }));
}

return createLocalScripts;
}

const type = 'helper';
const name = 'createScripts';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
