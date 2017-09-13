'use strict';

const init = require('../../lib/register_functions/content_asset_decorator_processor');

describe('register content asset decorator processor', () => {
  let registerFn;
  let callOrder;
  const processorsMap = new Map();
  const initialData = {};

  beforeEach(() => {
    callOrder = [];
    registerFn = init({
      generatorConfig: {
        decorator: {
          common: {
            foo: 'bar',
            path: 'decorator',
          },
          foo: { dummy: 'dummy' },
          active: ['foo', 'baz'],
        },
      },
      commonConfig: { common: 'config' },
      initialPipelineData: initialData,
      processors: processorsMap,
      callOrder,
      basePath: 'base',
    });
  });

  it('should add the processor to the processors map', () => {
    registerFn('decorator', 'foo', () => {});

    expect(processorsMap.has('foo')).toBe(true);
  });

  it('should not add a processor if it is not in the active list', () => {
    registerFn('decorator', 'bar', () => {});

    expect(processorsMap.has('bar')).toBe(false);
  });

  it('should add each processor into callOrder in the order it was registered', () => {
    registerFn('decorator', 'foo', () => {});
    registerFn('decorator', 'baz', () => {});

    expect(callOrder).toEqual(['foo', 'baz']);
  });

  it('should add a processor only once into the callOrder', () => {
    registerFn('decorator', 'foo', () => {});
    registerFn('decorator', 'foo', () => {});

    expect(callOrder).toEqual(['foo']);
  });

  it('should add initial data for a processor', () => {
    registerFn('decorator', 'foo', () => {});
    registerFn('decorator', 'baz', () => {});

    expect(initialData.foo).toBe('base/decorator/foo');
    expect(initialData.baz).toBe('base/decorator/baz');
  });

  it('should call a given processor with the given configs', () => {
    const spy = jasmine.createSpy('foo processor');
    registerFn('decorator', 'foo', spy);

    const args = spy.calls.argsFor(0);
    expect(args[0]).toEqual({
      processorConfig: { dummy: 'dummy' },
      processorCommonConfig: { path: 'decorator', foo: 'bar' },
      commonConfig: { common: 'config' },
    });
    // extendify function
    expect(typeof args[1]).toBe('function');
  });

  it('should overwrite the first processor if a second of the same name is given', () => {
    registerFn('decorator', 'foo', () => { return 'first'; });
    registerFn('decorator', 'foo', () => { return 'second'; });

    expect(processorsMap.get('foo')).toBe('second');
  });
});
