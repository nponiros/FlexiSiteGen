'use strict';

function splitBody(body, splitterString) {
  const splitter = new RegExp(splitterString, 'g');
  const matches = body.match(splitter);
  if (matches) {
    const content = {};
    for (let i = 0; i < matches.length; i++) {
      const indexOfMatch = body.indexOf(matches[i]);
      let indexOfNextMatch = body.indexOf(matches[i + 1]);
      indexOfNextMatch = indexOfNextMatch === -1 ? undefined : indexOfNextMatch;
      content[matches[i].substring(3, matches[i].length - 3)] = body.substring(indexOfMatch + matches[i].length, indexOfNextMatch);
    }
    return content;
  } else {
    // No sections, just return the body as content
    return {
      content: body
    };
  }
}

module.exports = splitBody;
