'use strict';

const registration = require('../../../lib/plugins/file/yaml');

describe('yaml file processor', () => {
  let yamlProcessor;

  beforeAll(() => {
    registration((type, name, extensions, fn) => {
      yamlProcessor = fn;
    });
  });

  it('should return an object based on the give string', () => {
    const res = yamlProcessor('foo: bar');

    expect(res).toEqual(res);
  });
});
