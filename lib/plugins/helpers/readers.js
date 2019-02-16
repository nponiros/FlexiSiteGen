'use strict';

const fs = require('fs-extra');
const walkSync = require('klaw-sync');

function readFileToString(path, opts) {
  opts = opts || { encoding: 'utf8' };
  return fs.readFileSync(path, opts);
}

function readFileToBuffer(path, opts) {
  return fs.readFileSync(path, opts);
}

function readDirectory(dirPath) {
  return fs.readdirSync(dirPath).map((path) => `${dirPath}/${path}`);
}

function readDirectoryRecursive(dirPath) {
  return walkSync(dirPath, { nodir: true }).map((file) => file.path);
}

function isDirectory(path) {
  return fs.lstatSync(path).isDirectory();
}

const readers = {
  fileToString: readFileToString,
  fileToBuffer: readFileToBuffer,
  dir: readDirectory,
  dirRecursive: readDirectoryRecursive,
  isDir: isDirectory,
};

const type = 'helper';
const name = 'readers';
function registration(register) {
  register(type, name, readers);
}

module.exports = registration;
