'use strict';

const path = require('path');
const Terser = require('terser');

function init({
  processorConfig,
  processorCommonConfig,
  commonConfig,
}) {
  const config = Object.assign({}, commonConfig, processorCommonConfig, processorConfig);

  function read(basePath, { readers }) {
    const scriptPaths = readers.dir(`${basePath}`);
    const scripts = scriptPaths.map((scriptPath) => {
      return {
        id: path.basename(scriptPath),
        name: path.basename(scriptPath),
        isBundle: false,
        contents: readers.fileToString(scriptPath),
      };
    });
    const bundles = config.bundles ? config.bundles.map((bundle) => {
      return {
        id: bundle.name,
        name: bundle.name,
        isBundle: true,
        files: bundle.files,
      };
    }) : [];
    return [...scripts, ...bundles];
  }

  // script has name, path
  function preprocess(scripts, helpers) {
    return scripts.map((script) => {
      if (script.isBundle) {
        script.contents = script.files.reduce((s, fileName) => {
          return s + scripts.object[fileName].contents;
        }, '');
      }

      const next = Object.assign({}, script);

      if (config.cacheBust) {
        const fingerprintOpts = { env: config.productionMode ? 'production' : 'dev' };
        const filename = helpers.fingerprint(script.name, script.contents, fingerprintOpts).file;
        next.writePath = `scripts/${path.basename(script.name, '.js')}-${filename}`;
      } else {
        next.writePath = `scripts/${script.name}`;
      }
      return next;
    });
  }

  // script has name, path, writePath
  function templateVariables(scripts) {
    return scripts.map((script) => {
      const next = Object.assign({}, script);
      next.url = '/' + script.writePath;
      return next;
    });
  }

  // script has name, path, writePath
  function postprocess(scripts) {
    return scripts.map((script) => {
      if (config.productionMode) {
        config.minify = config.minify || {};
        const { code, error } = Terser.minify(script.contents, config.minify);

        if (error) {
          throw error;
        } else {
          script.contents = code;
        }
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
    templateVariables,
    postprocess,
    write,
  };
}

const type = 'asset';
const name = 'scripts';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
