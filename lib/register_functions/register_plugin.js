'use strict';

function registerPlugin(type, ...args) {
  if (type === 'file') {
    registerFileProcessor(...args);
  } else if (type === 'helper') {
    registerHelper(type, ...args);
  } else {
    registerProcessor(type, ...args);
  }
}
