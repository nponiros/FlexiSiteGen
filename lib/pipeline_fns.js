'use strict';

function init(graphs, siteConfig, actionFns) {
  const readers = actionFns.readers;
  const processFile = actionFns.processFile;
  const renderTemplate = actionFns.renderTemplate;
  const writers = actionFns.writers;
  const localHelpers = actionFns.localHelpers;

  function isPromise(obj) {
    return obj !== null && typeof obj === 'object' && typeof obj.then === 'function';
  }

  function callAction(nodeName, actionName, fns, currentData, dependencyData, nextData) {
    const dataToPass = currentData[nodeName];
    if (actionName === 'process') {
      dataToPass.locals = currentData.locals;
    }
    const obj = graphs.get(actionName)._graph.getNodeData(nodeName).fn(dataToPass, fns || dependencyData, dependencyData);
    const promise = isPromise(obj) ? obj : Promise.resolve(obj);
    return promise.then((data) => {
      nextData[nodeName] = data;
      return data;
    });
  }

  function resolver(nodeName, currentData, actionName, fns, nextData) {
    const dependants = graphs.get(actionName)._graph.dependantsOf(nodeName);

    const promises = dependants.map((dependant) => {
      return resolver(dependant, currentData, actionName, fns, nextData);
    });
    return Promise.all(promises).then((data) => {
      const dependencyData = {};
      dependants.forEach((dependant, index) => {
        dependencyData[dependant] = data[index];
        nextData[dependant] = data[index];
      });
      return callAction(nodeName, actionName, fns, currentData, dependencyData, nextData);
    });
  }

// Data is an object with keys each type
  function processReaders(data, next) {
    // processors that no one depends on, those might have dependencies though (semantically -> technically we built a reversed dependency graph)
    const roots = graphs.get('read')._graph.overallOrder(true);
    const nextData = {};
    const dependencies = roots.map((root) => resolver(root, data, 'read', readers, nextData));

    Promise.all(dependencies).then(() => {
      next(nextData);
    });
  }

  function processPreprocessors(data, next) {
    // processors that no one depends on, those might have dependencies though (semantically -> technically we built a reversed dependency graph)
    const roots = graphs.get('preprocess')._graph.overallOrder(true);
    const nextData = {};
    const dependencies = roots.map((root) => resolver(root, data, 'preprocess', processFile, nextData));

    Promise.all(dependencies).then(() => {
      next(nextData);
    });
  }

  function processLocalCreators(data, next) {
    // processors that no one depends on, those might have dependencies though (semantically -> technically we built a reversed dependency graph)
    const roots = graphs.get('createLocals')._graph.overallOrder(true);
    const nextData = {};
    const dependencies = roots.map((root) => resolver(root, data, 'createLocals', localHelpers, nextData));

    Promise.all(dependencies).then(() => {
      nextData.site = siteConfig;
      data.locals = nextData;
      next(data)
    });
  }

// Data is an object with keys each type and locals
  function processProcessors(data, next) {
    // processors that no one depends on, those might have dependencies though (semantically -> technically we built a reversed dependency graph)
    const roots = graphs.get('process')._graph.overallOrder(true);
    const nextData = {};
    const dependencies = roots.map((root) => resolver(root, data, 'process', renderTemplate, nextData));

    Promise.all(dependencies).then(() => {
      next(nextData);
    });
  }

  function processPostprocessors(data, next) {
// processors that no one depends on, those might have dependencies though (semantically -> technically we built a reversed dependency graph)
    const roots = graphs.get('postprocess')._graph.overallOrder(true);
    const nextData = {};
    const dependencies = roots.map((root) => resolver(root, data, 'postprocess', renderTemplate, nextData));

    Promise.all(dependencies).then(() => {
      next(nextData);
    });
  }

  function processWriters(data, next) {
// processors that no one depends on, those might have dependencies though (semantically -> technically we built a reversed dependency graph)
    const roots = graphs.get('write')._graph.overallOrder(true);
    const nextData = {};
    const dependencies = roots.map((root) => resolver(root, data, 'write', writers, nextData));

    Promise.all(dependencies).then(() => {
      next();
    });
  }

  return {
    processReaders,
    processPreprocessors,
    processLocalCreators,
    processProcessors,
    processPostprocessors,
    processWriters
  };
}

module.exports = init;