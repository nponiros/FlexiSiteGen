'use strict';

const frontMatter = require('front-matter');

const splitterExpression = '<!---(.*)--->';
function process(fileContents, opts, { bodySplitter }) {
  if (opts.isDirectory) {
    return fileContents;
  } else {
    const data = frontMatter(fileContents);
    const splitted = bodySplitter(data.body, splitterExpression);
    return {
      meta: data.attributes,
      content: splitted
    };
  }
}

const type = 'file';
const name = 'html';
const extensions = ['.html', '.htm'];
function registration(register) {
  register(type, name, extensions, process);
}

module.exports = registration;
