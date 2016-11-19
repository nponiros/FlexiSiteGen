'use strict';

const fs = require('fs');

function init() {
  function readFileToString(path, opts) {
    opts = opts || {encoding: 'utf8'};
    return fs.readFileSync(path, opts);
  }

  function readFileToBuffer(path, opts) {
    return fs.readFileSync(path, opts);
  }

  function readDirectory(dirPath) {
    return fs.readdirSync(dirPath).map((path) => {
      return `${dirPath}/${path}`;
    });
  }

  function isDirectory(path) {
    return fs.lstatSync(path).isDirectory()
  }

  return {
    fileToString: readFileToString,
    fileToBuffer: readFileToBuffer,
    dir: readDirectory,
    isDir: isDirectory
  };
}

const type = 'helper';
const name = 'readers';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
