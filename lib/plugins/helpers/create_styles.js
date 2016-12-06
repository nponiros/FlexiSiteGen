'use strict';

// styles are the template variable styles from the asset processor
function createLocalScripts(configStyles, { styles: metaStyles = [] }, styles) {
  // Styles defined for this resource
  const contentStyles = [...configStyles, ...metaStyles]
      .reduce((map, style) => Object.assign(map, { [style.name]: style }), {});

  return Object.keys(contentStyles)
      .map((styleName) => ({
        url: styles[styleName].url,
        opts: contentStyles[styleName].opts,
      }));
}

const type = 'helper';
const name = 'createStyles';
function registration(register) {
  register(type, name, createLocalScripts);
}

module.exports = registration;
