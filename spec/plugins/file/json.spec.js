'use strict';

const registration = require('../../../lib/plugins/file/json');

describe('json file processor', () => {
  let jsonProcessor;

  beforeAll(() => {
    registration((type, name, extensions, fn) => {
      jsonProcessor = fn;
    });
  });

  it('should return an object based on the give string', () => {
    const res = jsonProcessor('{"foo": "bar"}');

    expect(res).toEqual(res);
  });
});
