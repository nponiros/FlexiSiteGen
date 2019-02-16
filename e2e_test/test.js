'use strict';

const fs = require('fs-extra');
const walkSync = require('klaw-sync');
const assert = require('assert');

const generateFn = require('../lib/actions/generate');

const basePath = process.cwd();
const testBasePath = basePath + '/e2e_test/test_site';
const expectationDir = testBasePath + '/expectation';
const expectationProdDir = testBasePath + '/expectation_prod';
const publicDir = testBasePath + '/public';

function t1(done) {
  console.log('generate test');
  generateFn(testBasePath, { isProd: false, cacheBust: false }, (_, n) => {
    n();

    const result = walkSync(publicDir, { nodir: true });
    const expectation = walkSync(expectationDir, { nodir: true });

    assert(result.length === expectation.length, 'The number of files in the directories do not match');

    const resultFiles = result.reduce((map, file) => Object.assign(
      map,
      { [file.path]: fs.readFileSync(file.path, { encoding: 'utf8' }) }
    ), {});

    const expectedFiles = expectation.reduce((map, file) => Object.assign(
      map,
      { [file.path.replace(expectationDir, publicDir)]: fs.readFileSync(file.path, { encoding: 'utf8' }) }
    ), {});

    const keys = Object.keys(expectedFiles);
    keys.forEach((key) => {
      assert(expectedFiles[key] === resultFiles[key], `The files do not match. File was: ${key}`);
    });

    fs.removeSync(publicDir);

    done();
  });
}

function t2(done) {
  console.log('generate test production mode');
  generateFn(testBasePath, { isProd: true, cacheBust: false }, (_, n) => {
    n();

    const result = walkSync(publicDir, { nodir: true });
    const expectation = walkSync(expectationProdDir, { nodir: true });

    assert(result.length === expectation.length, 'The number of files in the directories do not match');

    const resultFiles = result.reduce((map, file) => Object.assign(
      map,
      { [file.path]: fs.readFileSync(file.path, { encoding: 'utf8' }) }
    ), {});

    const expectedFiles = expectation.reduce((map, file) => Object.assign(
      map,
      { [file.path.replace(expectationProdDir, publicDir)]: fs.readFileSync(file.path, { encoding: 'utf8' }) }
    ), {});

    const keys = Object.keys(expectedFiles);
    keys.forEach((key) => {
      assert(expectedFiles[key] === resultFiles[key], `The files do not match. File was: ${key}`);
    });

    fs.removeSync(publicDir);

    done();
  });
}

t1(() => {
  t2(() => {
    console.log('All tests done');
  });
});
