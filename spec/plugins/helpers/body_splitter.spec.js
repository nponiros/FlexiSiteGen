'use strict';

const registration = require('../../../lib/plugins/helpers/body_splitter');

describe('splitBody()', () => {
  let splitBody;

  beforeAll(() => {
    registration((type, name, fn) => {
      splitBody = fn;
    });
  });

  it('should return an object with all contents if no sections were found', () => {
    const body = 'The body of the file';
    const result = splitBody(body, '---(.*)---');

    expect(result).toEqual({ content: body });
  });

  it('should be able to handle a file with only one section', () => {
    const section1 = 'This is the first section';
    const body = `
        ---section1---
        ${section1}
    `;
    const result = splitBody(body, '---(.*)---');

    expect(result.section1.indexOf(section1)).not.toBe(-1);
  });

  it('should be able to handle files with multiple sections', () => {
    const section1 = 'This is the first section';
    const section2 = 'This is the second section';
    const body = `
        ---section1---
        ${section1}

        ---section2---
        ${section2}
    `;
    const result = splitBody(body, '---(.*)---');

    expect(result.section1.indexOf(section1)).not.toBe(-1);
    expect(result.section1.indexOf(section2)).toBe(-1);
    expect(result.section2.indexOf(section1)).toBe(-1);
    expect(result.section2.indexOf(section2)).not.toBe(-1);
  });

  it('should be able to handle a custom splitter', () => {
    const section1 = 'This is the first section';
    const section2 = 'This is the second section';
    const body = `
        ===section1===
        ${section1}

        ===section2===
        ${section2}
    `;
    const result = splitBody(body, '===(.*)===');

    expect(result.section1.indexOf(section1)).not.toBe(-1);
    expect(result.section1.indexOf(section2)).toBe(-1);
    expect(result.section2.indexOf(section1)).toBe(-1);
    expect(result.section2.indexOf(section2)).not.toBe(-1);
  });

  it('should work with arbitrary long splitters', () => {
    const section1 = 'This is the first section';
    const section2 = 'This is the second section';
    const body = `
        <!--section1--->
        ${section1}

        <!--section2--->
        ${section2}
    `;
    const result = splitBody(body, '<!--(.*)--->');

    expect(result.section1.indexOf(section1)).not.toBe(-1);
    expect(result.section1.indexOf(section2)).toBe(-1);
    expect(result.section2.indexOf(section1)).toBe(-1);
    expect(result.section2.indexOf(section2)).not.toBe(-1);
  });

  it('should work when the content contains the word "undefined"', () => {
    const section1 = 'This section contains undefined';
    const section2 = 'This section does not contain undefined';

    const body = `
        ---section1---
        ${section1}

        ---section2---
        ${section2}
    `;
    const result = splitBody(body, '---(.*)---');

    expect(result.section1.indexOf(section1)).not.toBe(-1);
    expect(result.section1.indexOf(section2)).toBe(-1);
    expect(result.section2.indexOf(section1)).toBe(-1);
    expect(result.section2.indexOf(section2)).not.toBe(-1);
  });
});
