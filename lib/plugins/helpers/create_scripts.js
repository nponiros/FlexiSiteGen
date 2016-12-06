'use strict';

// scripts are the template variable scripts from the asset processor
function createLocalScripts(configScripts, { scripts: metaScripts = [] }, scripts) {
  // Scripts defined for this resource
  const contentScripts = [...configScripts, ...metaScripts]
    .reduce((map, script) => Object.assign(map, { [script.name]: script }), {});

  return Object.keys(contentScripts)
    .map((scriptName) => ({
      url: scripts[scriptName].url,
      opts: contentScripts[scriptName].opts,
    }));
}

const type = 'helper';
const name = 'createScripts';
function registration(register) {
  register(type, name, createLocalScripts);
}

module.exports = registration;
