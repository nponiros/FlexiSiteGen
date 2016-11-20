'use strict';

function init(graphs, db, helperFunctions) {
  function isPromise(obj) {
    return obj !== null && typeof obj === 'object' && typeof obj.then === 'function';
  }

  function callAction(nodeName, actionName, fns, currentData, dependencyData, nextData) {
    // TODO consider passing all data not only currentData[nodeName]
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

  function execProcessor(action, data, next) {
    // processors that no one depends on, those might have dependencies though (semantically -> technically we built a reversed dependency graph)
    const roots = graphs.get(action)._graph.overallOrder(true);
    const nextData = {};
    const dependencies = roots.map((root) => resolver(root, data, action, helperFunctions, nextData));

    Promise.all(dependencies).then(() => {
      next(nextData);
    });
  }

  // Data is an object with keys for each type
  function processReaders(data, next) {
    execProcessor('read', data, next);
  }

  function processPreprocessors(data, next) {
    execProcessor('preprocess', data, next);
  }

  function processLocalCreators(data, next) {
    // processors that no one depends on, those might have dependencies though (semantically -> technically we built a reversed dependency graph)
    const roots = graphs.get('createLocals')._graph.overallOrder(true);
    const nextData = {};
    const dependencies = roots.map((root) => resolver(root, data, 'createLocals', helperFunctions, nextData));
    db.set('locals', nextData);
    Promise.all(dependencies).then(() => {
      data.locals = nextData;
      next(data)
    });
  }

  // Data is an object with keys each type and locals
  function processProcessors(data, next) {
    execProcessor('process', data, next);
  }

  function processPostprocessors(data, next) {
    execProcessor('postprocess', data, next);
  }

  function processWriters(data, next) {
    execProcessor('write', data, next);
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