'use strict';

function init({ helpers }) {
  function registerHelper(name, init) {
    helpers[name] = init();
  }

  return registerHelper;
}

module.exports = init;
