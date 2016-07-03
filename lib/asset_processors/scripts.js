'use strict';

const path = require('path');
const UglifyJS = require('uglify-js');

function init(processorOpts, globalProcessorOpts, globalOpts) {
  const config = Object.assign({}, globalOpts, globalProcessorOpts, processorOpts);

  function read(basePath, readers) {
    const scriptPaths = readers.dir(`${basePath}`);
    const scripts = scriptPaths.map((scriptPath) => {
      return {
        name: path.basename(scriptPath),
        path: scriptPath,
        contents: readers.fileToString(scriptPath)
      };
    });
    return scripts;
  }

// script has name, path
  function preprocess(scripts) {
    return scripts.map((script) => {
      const next = Object.assign({}, script);
      next.writePath = `scripts/${script.name}`;
      return next;
    });
  }

// script has name, path, writePath
  function createLocals(scripts) {
    return scripts.map((script) => {
      const next = Object.assign({}, script);
      next.url = `/scripts/${script.name}`;
      return next;
    });
  }

// script has name, path, writePath
  function postprocess(scripts) {
    return scripts.map((script) => {
      if (config.productionMode) {
        config.minify = config.minify || {};
        config.minify.fromString = true;
        script.contents = UglifyJS.minify(script.contents, config.minify).code;
      }
      return script;
    });
  }

// script has name, path, writePath
  function write(scripts, writer) {
    scripts.forEach((script) => {
      writer.file(`${config.outputDir}/${script.writePath}`, script.contents);
    });
  }

  const processor = {
    read,
    preprocess,
    createLocals,
    postprocess,
    write
  };
  return processor;
}

const type = 'asset';
const name = 'scripts';
const dependsOn = undefined;
function registration(register) {
  register(type, name, dependsOn, init);
}

module.exports = registration;
