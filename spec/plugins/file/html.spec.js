'use strict';

const registration = require('../../../lib/plugins/file/html');
const bodySplitterRegistration = require('../../../lib/plugins/helpers/body_splitter');
let bodySplitter;

bodySplitterRegistration((a, b, fn) => {
  bodySplitter = fn;
});

describe('html file processor', () => {
  let htmlProcessor;

  beforeAll(() => {
    registration((type, name, extensions, fn) => {
      htmlProcessor = fn;
    });
  });

  const htmlWithFrontMatter = `---
foo: 'bar'
---

<h1>Title</h1>
`;

  const htmlWithSections = `
<!---first---->
<h1>First section</h1>

<!---last---->
<h1>Last section</h1>
`;

  const htmlWithFrontMatterAndSections = `---
foo: 'bar'
---

<!---first---->
<h1>First section</h1>

<!---last---->
<h1>Last section</h1>
`;

  const htmlWithComments = `
<!-Comment-->
Foobar baz
`;

  it('should return fileContents as is if we are dealing with a directory', () => {
    const res = htmlProcessor('contents', { isDirectory: true }, {});

    expect(res).toBe('contents');
  });

  it('should return the front matter as meta attribute', () => {
    const res = htmlProcessor(htmlWithFrontMatter, {}, { bodySplitter });

    expect(res.meta).toEqual({ foo: 'bar' });
  });

  it('should return the contents for the file in the content.content property if we have no sections', () => {
    const res = htmlProcessor(htmlWithFrontMatter, {}, { bodySplitter });

    expect(res.content).toEqual({ content: '<h1>Title</h1>\n' });
  });

  it('should return the sections in the content property', () => {
    const res = htmlProcessor(htmlWithSections, {}, { bodySplitter });

    expect(res.content.first).toEqual('\n<h1>First section</h1>\n\n');
    expect(res.content.last).toEqual('\n<h1>Last section</h1>\n');
  });

  it('should be able to work with front matter and sections', () => {
    const res = htmlProcessor(htmlWithFrontMatterAndSections, {}, { bodySplitter });

    expect(res.meta).toEqual({ foo: 'bar' });
    expect(res.content.first).toEqual('\n<h1>First section</h1>\n\n');
    expect(res.content.last).toEqual('\n<h1>Last section</h1>\n');
  });

  it('should ignore html comments', () => {
    const res = htmlProcessor(htmlWithComments, {}, { bodySplitter });

    expect(res.content.content).toEqual('\n<!-Comment-->\nFoobar baz\n');
  });
});
