'use strict';

function init(processors, callOrder, db, helperFunctions) {
  function isPromise(obj) {
    return obj !== null && typeof obj === 'object' && typeof obj.then === 'function';
  }

  function callAction(processor, processorName, actionName, currentData, nextData) {
    const dataToPass = currentData[processorName];
    const actionFn = processor[actionName];
    const obj = actionFn ? actionFn(dataToPass, helperFunctions, db) : dataToPass; // in case an actionFn is not defined, return previous data
    const promise = isPromise(obj) ? obj : Promise.resolve(obj);
    return promise.then((data) => {
      nextData[processorName] = data;
      if (Array.isArray(data)) {
        nextData[processorName].object = data.reduce((map, cur) => Object.assign({}, map, { [cur.id]: cur }), {});
      }
      db.set(actionName, nextData);
      return data;
    });
  }

  // After first action done, call next until alla actions done
  function execProcessor(actionName, data, next, index = 0, nextData = {}) {
    if (index === callOrder.length) {
      next(nextData);
    } else {
      const processorName = callOrder[index];
      const processor = processors.get(processorName);
      callAction(processor, processorName, actionName, data, nextData)
          .then(() => execProcessor(actionName, data, next, index + 1, nextData));
    }
  }

  // Data is an object with keys for each type
  function processReaders(data, next) { // Gets called from pipeline.js
    execProcessor('read', data, next);
  }

  function processPreprocessors(data, next) {
    execProcessor('preprocess', data, next);
  }

  function processTemplateVariables(data, next) {
    execProcessor('templateVariables', data, next);
  }

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
    processTemplateVariables,
    processProcessors,
    processPostprocessors,
    processWriters,
  };
}

module.exports = init;
