'use strict';

function noopAction(data) {
  return data;
}

function init({
    generatorConfig,
    globalConfig,
    initialPipelineData,
    processorActions,
    graphs,
    basePath,
    processors
}) {
  return function registerProcessor(type, name, dependsOn, initFn) {
    let processor;
    const processorsConfig = generatorConfig[type + 'Processors'];
    const processorConfig = processorsConfig && generatorConfig[type + 'Processors'][name];
    const processorGlobalConfig = processorsConfig && generatorConfig[type + 'Processors'].global;
    const activeProcessors = processorsConfig && processorsConfig.active;

    if (activeProcessors && activeProcessors.indexOf(name) !== -1) {
      const configs = {
        processorConfig,
        processorGlobalConfig,
        globalConfig
      };
      processor = initFn(configs, processors[type]);
      initialPipelineData[name] = `${basePath}/${processorsConfig.path}/${name}`;

      processorActions.forEach((action) => {
        // Only the first processor with a given name is considered
        graphs.get(action).addNode(name, processor[action] || noopAction, dependsOn);
      });
    }
  }
}

module.exports = init;
