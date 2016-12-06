'use strict';

const registration = require('../../../lib/plugins/helpers/create_scripts');

describe('createScripts()', () => {
  let createScripts;

  beforeAll(() => {
    registration((type, name, fn) => {
      createScripts = fn;
    });
  });

  it('should get an array of script objects with names and return an object with the URL for the script', () => {
    const scripts = {
      'foo.js': {
        url: 'bar/foo/foo.js',
      },
    };

    const scriptsArray = [{ name: 'foo.js' }];

    const res = createScripts(scriptsArray, {}, scripts);

    expect(res).toEqual([{ url: 'bar/foo/foo.js', opts: undefined }]);
  });

  it('should be able to also get an array of scripts as part of the meta data of a page etc.', () => {
    const scripts = {
      'foo.js': {
        url: 'bar/foo/foo.js',
      },
      'bar.js': {
        url: 'foo/bar/bar.js',
      },
    };

    const scriptsArray = [{ name: 'foo.js' }];
    const metaData = {
      scripts: [{ name: 'bar.js' }],
    };

    const res = createScripts(scriptsArray, metaData, scripts);

    expect(res).toEqual([
      { url: 'bar/foo/foo.js', opts: undefined },
      { url: 'foo/bar/bar.js', opts: undefined },
    ]);
  });

  it('should support options for each script like async etc.', () => {
    const scripts = {
      'foo.js': {
        url: 'bar/foo/foo.js',
      },
      'bar.js': {
        url: 'foo/bar/bar.js',
      },
    };

    const scriptsArray = [{ name: 'foo.js', opts: { async: true } }];
    const metaData = {
      scripts: [{ name: 'bar.js', opts: { async: false } }],
    };

    const res = createScripts(scriptsArray, metaData, scripts);

    expect(res).toEqual([
      { url: 'bar/foo/foo.js', opts: { async: true } },
      { url: 'foo/bar/bar.js', opts: { async: false } },
    ]);
  });

  it('should use the script from the meta scripts if both arrays contain a script with the same name', () => {
    const scripts = {
      'foo.js': {
        url: 'bar/foo/foo.js',
      },
      'bar.js': {
        url: 'foo/bar/bar.js',
      },
    };

    const scriptsArray = [{ name: 'foo.js', opts: { async: true } }];
    const metaData = {
      scripts: [{ name: 'foo.js', opts: { async: false } }],
    };

    const res = createScripts(scriptsArray, metaData, scripts);

    expect(res).toEqual([{ url: 'bar/foo/foo.js', opts: { async: false } }]);
  });
});
