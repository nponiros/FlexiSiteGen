const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const assert = require('assert');

const generateFn = require('../lib/actions/generate');

/*

 E2E:

 * need to call builder on the correct test_site -> DONE
 * need to create a result => use public -> DONE
 * need to know when building is done -> use done function => DONE
 * need to compare public with expectation
 * recurse, read each file and compare as buffer

 */

const basePath = process.cwd();
const testBasePath = basePath + '/e2e_test/test_site';
const expectationDir = testBasePath + '/expectation';
const publicDir = testBasePath + '/public';
generateFn(testBasePath, false, (_, n) => {
  n();

  var walkSync = function(dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = walkSync(path.join(dir, file), filelist);
      }
      else {
        filelist.push(path.join(dir, file));
      }
    });
    return filelist;
  };

  const result = walkSync(publicDir, []);
  const expectation = walkSync(expectationDir, []);

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

  fsExtra.removeSync(publicDir);
});
