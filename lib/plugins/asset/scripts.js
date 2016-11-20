'use strict';

const path = require('path');
const UglifyJS = require('uglify-js');

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}) {
  const config = Object.assign({}, globalConfig, processorGlobalConfig, processorConfig);

  function read(basePath, { readers }) {
    const scriptPaths = readers.dir(`${basePath}`);
    const scripts = scriptPaths.map((scriptPath) => {
      return {
        name: path.basename(scriptPath),
        isBundle: false,
        contents: readers.fileToString(scriptPath)
      };
    });
    const bundles = config.bundles ? config.bundles.map((bundle) => {
      return {
        name: bundle.name,
        isBundle: true,
        files: bundle.files
      }
    }) : [];
    return [...scripts, ...bundles];
  }

// script has name, path
  function preprocess(scripts) {
    const array = scripts.map((script) => {
      const next = Object.assign({}, script);
      next.writePath = `scripts/${script.name}`;
      return next;
    });
    const object = scripts.reduce((map, script) => Object.assign({}, map, {[script.name]: script}), {});
    return {
      array,
      object
    };
  }

// script has name, path, writePath
  function locals(scripts) {
    const scriptLocals = scripts.array.map((script) => {
      const next = Object.assign({}, script);
      next.url = `/scripts/${script.name}`;
      scripts.object[script.name].url = next.url;
      return next;
    });
    return {
      array: scriptLocals,
      object: scripts.object
    };
  }

// script has name, path, writePath
  function postprocess(scripts) {
    return scripts.array.map((script) => {
      if (script.isBundle) {
        script.contents = script.files.reduce((s, fileName) => {
          return s + scripts.object[fileName].contents;
        }, '');
      }
      if (config.productionMode) {
        config.minify = config.minify || {};
        config.minify.fromString = true;
        script.contents = UglifyJS.minify(script.contents, config.minify).code;
      }
      return script;
    });
  }

// script has name, path, writePath
  function write(scripts, { writers }) {
    scripts.forEach((script) => {
      writers.file(`${config.outputDir}/${script.writePath}`, script.contents);
    });
  }

  return {
    read,
    preprocess,
    locals,
    postprocess,
    write
  };
}

const type = 'asset';
const name = 'scripts';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
