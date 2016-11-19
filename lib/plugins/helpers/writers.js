'use strict';

const fs = require('fs-extra');

function init() {
  function fileWriter(filePath, content) {
    fs.outputFileSync(filePath, content);
  }

  function copy(src, dest) {
    fs.copySync(src, dest);
  }

  return {
    file: fileWriter,
    copy: copy
  };
}

const type = 'helper';
const name = 'writers';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
