'use strict';

function splitBody(body, splitterString) {
  const splitter = new RegExp(splitterString, 'g');
  const matches = body.match(splitter);
  if (matches) {
    const content = {};
    for (let i = 0; i < matches.length; i++) {
      const indexOfMatch = body.indexOf(matches[i]);
      let indexOfNextMatch;
      if (matches[i + 1]) {
        indexOfNextMatch = body.indexOf(matches[i + 1]);
      }
      indexOfNextMatch = indexOfNextMatch === -1 ? undefined : indexOfNextMatch;

      const submatches = new RegExp(splitterString).exec(matches[i]);
      const key = submatches ? submatches[1] : undefined;
      content[key] = body
        .substring(indexOfMatch + matches[i].length, indexOfNextMatch);
    }
    return content;
  }
  // No sections, just return the body as content
  return {
    content: body,
  };
}

const type = 'helper';
const name = 'bodySplitter';
function registration(register) {
  register(type, name, splitBody);
}

module.exports = registration;
