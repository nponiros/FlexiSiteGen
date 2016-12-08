'use strict';

const init = require('../../lib/generic_processors/file_processor');

describe('generic file processor', () => {
  let genericFileProcessor;

  const textFileProcessor = {
    process: jasmine.createSpy('process spy'),
    extensions: ['.txt'],
  };

  const fileProcessors = new Map();
  fileProcessors.set('text', textFileProcessor);
  const helpers = {
    helperFn() {},
  };
  const defaultOpts = {
    common: { foo: 'bar' },
    text: { bar: 'baz' },
  };

  beforeAll(() => {
    genericFileProcessor = init(fileProcessors, defaultOpts, helpers);
  });

  afterEach(() => {
    textFileProcessor.process.calls.reset();
  });

  it('should offer direct access to the text file processor', () => {
    expect(typeof genericFileProcessor.text).toBe('function');
  });

  it('should throw an error if no processor is found for the given file', () => {
    const fn = function () {
      genericFileProcessor('foo.html', '', {});
    };

    expect(fn).toThrowError(`No file processor found for extension: .html. Given file: foo.html`);
  });

  it('should call the process function with the given contents', () => {
    genericFileProcessor('foo.txt', 'contents', {});

    expect(textFileProcessor.process.calls.argsFor(0)[0]).toBe('contents');
  });

  it('should return the output of the process function', () => {
    const fileProcessors = new Map().set('text', {
      process(contents) { return contents; },
      extensions: ['.txt'],
    });
    const genericFileProcessor = init(fileProcessors, defaultOpts, helpers);

    const res = genericFileProcessor('foo.txt', 'contents', {});
    expect(res).toBe('contents');
  });

  it('should merge defaultOpts and given options and pass those to process. Given options override defaultOpts', () => {
    genericFileProcessor('foo.txt', 'contents', { bar: 'foobar' });

    expect(textFileProcessor.process.calls.argsFor(0)[1]).toEqual({
      foo: 'bar',
      bar: 'foobar',
    });
  });

  it('should overwrite the common options with the processor options', () => {
    const defaultOpts = {
      common: { foo: 'bar' },
      text: { foo: 'baz' },
    };

    const genericFileProcessor = init(fileProcessors, defaultOpts, helpers);

    genericFileProcessor('foo.txt', 'contents', {});
    expect(textFileProcessor.process.calls.argsFor(0)[1]).toEqual({
      foo: 'baz',
    });
  });

  it('should pass the helper functions as last argument to process', () => {
    genericFileProcessor('foo.txt', 'contents', {});

    expect(textFileProcessor.process.calls.argsFor(0)[2].helperFn).not.toBeUndefined();
  });
});
