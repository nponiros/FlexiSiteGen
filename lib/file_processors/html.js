'use strict';

const frontMatter = require('front-matter');
const bodySplitter = require('./body_splitter');

const splitterExpression = '<!---(.*)--->';
function process(fileContents, opts) {
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

const processor = {
  process
};

const name = 'html';
const extensions = ['.html', '.htm'];
function registration(register) {
  register(name, extensions, processor);
}

module.exports = registration;
