'use strict';

const init = require('../../lib/register_functions/helper');

describe('register template processor', () => {
  let registerFn;
  const helpersMap = {};

  beforeAll(() => {
    registerFn = init({ helpers: helpersMap });
  });

  it('should add all processors to the given object', () => {
    registerFn('foo', () => {});
    registerFn('bar', () => {});

    expect(helpersMap.foo).not.toBeUndefined();
    expect(helpersMap.bar).not.toBeUndefined();
  });
});
