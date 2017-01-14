'use strict';

const registration = require('../../../lib/plugins/template/pug');

const pug = require('pug');

describe('pug template processor', () => {
  let pugTemplateProcessor;
  let renderSpy = jasmine.createSpy('render spy');

  beforeAll(() => {
    registration((type, name, extensions, fn) => {
      pugTemplateProcessor = fn;
    });
  });

  beforeEach(() => {
    spyOn(pug, 'compile').and.returnValue(renderSpy);
  });

  it('should add a filename property to the options object', () => {
    pugTemplateProcessor('templateName', '', { filenameWithPath: 'foobar' }, {});

    expect(pug.compile).toHaveBeenCalledWith('', {
      filenameWithPath: 'foobar',
      filename: 'foobar',
    });
  });

  it('should call render spy with the given template variables', () => {
    pugTemplateProcessor('templateName', '', { filenameWithPath: 'foobar' }, { vars: 'foo' });

    expect(renderSpy).toHaveBeenCalledWith({ vars: 'foo' });
  });
});
