'use strict';

function createScriptsAndStyles(assetsArray, assetsObject) {
  // remove duplicate names
  const assetsNoDuplicates = assetsArray.reduce((map, style) => Object.assign(map, { [style.name]: style }), {});

  return Object.keys(assetsNoDuplicates)
    .map((name) => ({
      url: assetsObject[name].url,
      opts: assetsNoDuplicates[name].opts,
    }));
}

module.exports = createScriptsAndStyles;
