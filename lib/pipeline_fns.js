'use strict';

function init(graphs, callOrder, db, helperFunctions) {
  function isPromise(obj) {
    return obj !== null && typeof obj === 'object' && typeof obj.then === 'function';
  }

  // TODO clean up
  function callAction(processor, type, actionName, fns, currentData, db, nextData) {
    const dataToPass = currentData[type];
    const fn = processor[actionName];
    const obj = fn ? fn(dataToPass, fns, db) : dataToPass; // in case an action fn is not defined, return previous data
    const promise = isPromise(obj) ? obj : Promise.resolve(obj);
    return promise.then((data) => {
      nextData[type] = data;
      if (Array.isArray(data)) {
        nextData[type].object = data.reduce((map, cur) => Object.assign({}, map, {[cur.id]: cur}), {});
      }
      db.set(actionName, nextData);
      return data;
    });
  }

  // After first action done, call next until alla actions done
  function execProcessor(action, data, index, nextData, next) {
    if (index === callOrder.length) {
      next(nextData);
    } else {
      const type = callOrder[index];
      const processor = graphs.get(type);
      callAction(processor, type, action, helperFunctions, data, db, nextData)
          .then(() => execProcessor(action, data, index + 1, nextData, next));
    }
  }

  // Data is an object with keys for each type
  function processReaders(data, next) { // Gets called from pipeline.js
    const nextData = {};
    execProcessor('read', data, 0, nextData, next);
  }

  function processPreprocessors(data, next) {
    const nextData = {};
    execProcessor('preprocess', data, 0, nextData, next);
  }

  function processTemplateVariables(data, next) {
   const nextData = {};
   execProcessor('templateVariables', data, 0, nextData, next);
  }

  function processProcessors(data, next) {
    const nextData = {};
    execProcessor('process', data, 0, nextData, next);
  }

  function processPostprocessors(data, next) {
    const nextData = {};
    execProcessor('postprocess', data, 0, nextData, next);
  }

  function processWriters(data, next) {
    const nextData = {};
    execProcessor('write', data, 0, nextData, next);
  }

  return {
    processReaders,
    processPreprocessors,
    processTemplateVariables,
    processProcessors,
    processPostprocessors,
    processWriters
  };
}

module.exports = init;
