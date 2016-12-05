'use strict';

const fs = require('fs-extra');
const path = require('path');
const assert = require('assert');

const generateFn = require('../lib/actions/generate');

const basePath = process.cwd();
const testBasePath = basePath + '/e2e_test/test_site';
const expectationDir = testBasePath + '/expectation';
const publicDir = testBasePath + '/public';
generateFn(testBasePath, false, (_, n) => {
  n();

  function getFilesList(dir, filelist) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = getFilesList(path.join(dir, file), filelist);
      } else {
        filelist.push(path.join(dir, file));
      }
    });
    return filelist;
  }

  const result = getFilesList(publicDir, []);
  const expectation = getFilesList(expectationDir, []);

  assert(result.length === expectation.length, 'The number of files in the directories do not match');

  const resultFiles = result.reduce((map, filePath) => Object.assign(
    map,
    { [filePath]: fs.readFileSync(filePath, {encoding: 'utf8'}) }
  ), {});

  const expectedFiles = expectation.reduce((map, filePath) => Object.assign(
      map,
      { [filePath.replace(expectationDir, publicDir)]: fs.readFileSync(filePath, {encoding: 'utf8'}) }
  ), {});

  const keys = Object.keys(expectedFiles);
  keys.forEach((key) => {
    assert(expectedFiles[key] === resultFiles[key], `The files do not match. File was: ${key}`)
  });

  fs.removeSync(publicDir);
});
