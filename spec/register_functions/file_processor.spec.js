'use strict';

const init = require('../../lib/register_functions/file_processor');

describe('register file processor', () => {
  let registerFn;
  const processorsMap = new Map();

  beforeAll(() => {
    registerFn = init({ fileProcessors: processorsMap });
  });

  it('should add all processors to the given Map', () => {
    registerFn('foo', ['.foo'], () => {});
    registerFn('bar', ['.bar'], () => {});

    expect(processorsMap.get('foo').extensions).toEqual(['.foo']);
    expect(processorsMap.get('foo').process).not.toBeUndefined();

    expect(processorsMap.get('bar').extensions).toEqual(['.bar']);
    expect(processorsMap.get('bar').process).not.toBeUndefined();
  });

  it('should overwrite a given processor if the name already exists', () => {
    registerFn('foo', ['.foo'], () => {});
    registerFn('foo', ['.bar']);

    expect(processorsMap.get('foo').extensions).toEqual(['.bar']);
    expect(processorsMap.get('foo').process).toBeUndefined();
  });
});
