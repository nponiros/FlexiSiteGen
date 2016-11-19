'use strict';

function init({ helpers }) {
  function registerHelper(type, name, init) {
    helpers[name] = init();
  }

  return registerHelper;
}

module.exports = init;
