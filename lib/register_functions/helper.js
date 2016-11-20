'use strict';

function init({ helpers }) {
  function registerHelper(name, helper) {
    helpers[name] = helper;
  }

  return registerHelper;
}

module.exports = init;
