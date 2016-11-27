'use strict';

const registration = require('../../../lib/plugins/file/markdown');
const bodySplitterRegistration = require('../../../lib/plugins/helpers/body_splitter');
let bodySplitter;

bodySplitterRegistration((a, b, fn) => {
  bodySplitter = fn;
});

describe('makrdown file processor', () => {
  let markdownProcessor;

  beforeAll(() => {
    registration((type, name, extensions, fn) => {
      markdownProcessor = fn;
    });
  });

  const markdown = `
# Title
`;

  const markdownWithFrontMatter = `---
foo: 'bar'
---

# Title
`;

  const markdownWithSections = `
---first---
# First section

---last---
# Last section
`;

  const markdownWithFrontMatterAndSections = `---
foo: 'bar'
---

---first---
# First section

---last---
# Last section
`;

  const markdownWithCode = `
\`\`\`js
const foo = 'bar';
\`\`\`
`;

  it('should return rendered fileContents if we are dealing with a directory', () => {
    const res = markdownProcessor(markdown, { isDirectory: true }, {});

    expect(res).toBe('<h1>Title</h1>\n');
  });

  it('should return the front matter as meta attribute', () => {
    const res = markdownProcessor(markdownWithFrontMatter, {}, { bodySplitter });

    expect(res.meta).toEqual({ foo: 'bar' });
  });

  it('should return the contents for the file in the content.content property if we have no sections', () => {
    const res = markdownProcessor(markdownWithFrontMatter, {}, { bodySplitter });

    expect(res.content).toEqual({ content: '<h1>Title</h1>\n' });
  });

  it('should return the sections in the content property', () => {
    const res = markdownProcessor(markdownWithSections, {}, { bodySplitter });

    expect(res.content.first).toEqual('<h1>First section</h1>\n');
    expect(res.content.last).toEqual('<h1>Last section</h1>\n');
  });

  it('should be able to work with front matter and sections', () => {
    const res = markdownProcessor(
      markdownWithFrontMatterAndSections, {}, { bodySplitter }
    );

    expect(res.meta).toEqual({ foo: 'bar' });
    expect(res.content.first).toEqual('<h1>First section</h1>\n');
    expect(res.content.last).toEqual('<h1>Last section</h1>\n');
  });

  it('should not add highlightjs elements if it not explicitly set in the options', () => {
    const res = markdownProcessor(markdownWithCode, {}, { bodySplitter });

    expect(res.content.content).toEqual('<pre><code class="language-js">const foo = \'bar\';\n</code></pre>\n');
  });

  it('should add highlightjs elements if codeHighlight is set', () => {
    const res = markdownProcessor(markdownWithCode, { codeHighlight: true }, { bodySplitter });

    expect(res.content.content).toEqual('<pre><code class="language-js"><span class="hljs-keyword">const</span>' +
      'foo = <span class="hljs-string">\'bar\'</span>;\n</code></pre>\n');
  });

  it('should not add highlightjs elements if the code language is not supported by highlightjs', () => {
    const markdownWithCode = `
\`\`\`foo
const bar = 'foo';
\`\`\`
`;
    const res = markdownProcessor(markdownWithCode, { codeHighlight: true }, { bodySplitter });

    expect(res.content.content).toEqual('<pre><code class="language-foo">const bar = \'foo\';\n</code></pre>\n');
  });
});
