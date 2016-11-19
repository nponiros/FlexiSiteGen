'use strict';

const markdownIt = require('markdown-it');
const hljs = require('highlight.js');
const frontMatter = require('front-matter');

const bodySplitter = require('./../../file_processors/body_splitter');
const splitterExpression = '---(.*)---';

function process(fileContents, opts) {
  if (opts.codeHighlight) {
    opts.highlight = function(str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(lang, str).value;
      }
      return '';
    };
  }
  const md = markdownIt(opts);

  function processBodySplitterReturn(obj) {
    const keys = Object.keys(obj);
    return keys.reduce((map, key) => Object.assign({}, map, {
      [key]: md.render(obj[key])
    }), {});
  }

  if (opts.isDirectory) {
    return md.render(fileContents);
  } else {
    const data = frontMatter(fileContents);
    const splitted = bodySplitter(data.body, splitterExpression);
    return {
      meta: data.attributes,
      content: processBodySplitterReturn(splitted)
    };
  }
}

const processor = {
  process
};

const type = 'file';
const name = 'markdown';
const extensions = ['.markdown', '.mdown', '.mkdn', '.md', '.mkd', '.mdwn', '.mdtxt', '.mdtext'];
function registration(register) {
  register(type, name, extensions, processor);
}

module.exports = registration;
