'use strict';

function init({
    generatorConfig,
    globalConfig,
    initialPipelineData,
    processors,
    callOrder,
    basePath,
}) {
  return function registerProcessor(type, name, initFn) {
    const processorsConfig = generatorConfig[type];
    const processorConfig = processorsConfig && processorsConfig[name];
    const processorGlobalConfig = processorsConfig && processorsConfig.global;
    const activeProcessors = processorsConfig && processorsConfig.active;

    // Only add processors which are explicitly marked as active
    if (activeProcessors && activeProcessors.indexOf(name) !== -1) {
      const configs = {
        processorConfig,
        processorGlobalConfig,
        globalConfig,
      };
      const processor = initFn(configs);
      initialPipelineData[name] = `${basePath}/${processorsConfig.path}/${name}`;

      // If it already exists, don't add again
      if (callOrder.indexOf(name) === -1) {
        callOrder.push(name);
      }
      processors.set(name, processor);
    }
  };
}

module.exports = init;
