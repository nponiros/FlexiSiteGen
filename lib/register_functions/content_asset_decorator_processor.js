'use strict';

const extendify = require('extendify');

function init({
    generatorConfig,
    commonConfig,
    initialPipelineData,
    processors,
    callOrder,
    basePath,
}) {
  return function registerProcessor(type, name, initFn) {
    const processorsConfig = generatorConfig[type];
    const processorConfig = processorsConfig && processorsConfig[name];
    const processorCommonConfig = processorsConfig && processorsConfig.common;
    const activeProcessors = processorsConfig && processorsConfig.active;

    // Only add processors which are explicitly marked as active
    if (activeProcessors && activeProcessors.indexOf(name) !== -1) {
      const configs = {
        processorConfig,
        processorCommonConfig,
        commonConfig,
      };

      const processor = initFn(configs, extendify);
      initialPipelineData[name] = `${basePath}/${processorCommonConfig.path}/${name}`;

      // If it already exists, don't add again
      if (callOrder.indexOf(name) === -1) {
        callOrder.push(name);
      }
      processors.set(name, processor);
    }
  };
}

module.exports = init;
