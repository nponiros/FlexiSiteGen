'use strict';

const registration = require('../../../lib/plugins/helpers/create_styles');

describe('createStyles()', () => {
  let createStyles;

  beforeAll(() => {
    registration((type, name, fn) => {
      createStyles = fn;
    });
  });

  it('should get an array of style objects with names and return an object with the URL for the styles', () => {
    const styles = {
      'foo.css': {
        url: 'bar/foo/foo.css',
      },
    };

    const stylesArray = [{ name: 'foo.css' }];

    const res = createStyles(stylesArray, {}, styles);

    expect(res).toEqual([{ url: 'bar/foo/foo.css', opts: undefined }]);
  });

  it('should be able to also get an array of styles as part of the meta data of a page etc.', () => {
    const styles = {
      'foo.css': {
        url: 'bar/foo/foo.css',
      },
      'bar.css': {
        url: 'foo/bar/bar.css',
      },
    };

    const stylesArray = [{ name: 'foo.css' }];
    const metaData = {
      styles: [{ name: 'bar.css' }],
    };

    const res = createStyles(stylesArray, metaData, styles);

    expect(res).toEqual([
      { url: 'bar/foo/foo.css', opts: undefined },
      { url: 'foo/bar/bar.css', opts: undefined },
    ]);
  });

  it('should support options for each style like media query etc.', () => {
    const styles = {
      'foo.css': {
        url: 'bar/foo/foo.css',
      },
      'bar.css': {
        url: 'foo/bar/bar.css',
      },
    };

    const stylesArray = [{ name: 'foo.css', opts: { media: 'all' } }];
    const metaData = {
      styles: [{ name: 'bar.css', opts: { media: 'screen' } }],
    };

    const res = createStyles(stylesArray, metaData, styles);

    expect(res).toEqual([
      { url: 'bar/foo/foo.css', opts: { media: 'all' } },
      { url: 'foo/bar/bar.css', opts: { media: 'screen' } },
    ]);
  });

  it('should use the style from the meta styles if both arrays contain a style with the same name', () => {
    const styles = {
      'foo.css': {
        url: 'bar/foo/foo.css',
      },
      'bar.css': {
        url: 'foo/bar/bar.css',
      },
    };

    const stylesArray = [{ name: 'foo.css', opts: { media: 'all' } }];
    const metaData = {
      styles: [{ name: 'foo.css', opts: { media: 'screen' } }],
    };

    const res = createStyles(stylesArray, metaData, styles);

    expect(res).toEqual([{ url: 'bar/foo/foo.css', opts: { media: 'screen' } }]);
  });
});
