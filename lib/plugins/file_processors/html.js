'use strict';

const frontMatter = require('front-matter');
const bodySplitter = require('./../../file_processors/body_splitter');

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

const type = 'file';
const name = 'html';
const extensions = ['.html', '.htm'];
function registration(register) {
  register(type, name, extensions, processor);
}

module.exports = registration;
