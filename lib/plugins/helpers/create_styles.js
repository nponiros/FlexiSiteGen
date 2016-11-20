'use strict';

// styles are the local styles from the asset processor
function createLocalStyles(configStyles, contentMeta, styles) {
  // Styles defined for this resource
  const contentStyles = [...configStyles, ...(contentMeta.styles || [])];
  return contentStyles.map((style) => ({
    url: styles[style.name].url,
    opts: style.opts
  }));
}

const type = 'helper';
const name = 'createStyles';
function registration(register) {
  register(type, name, createLocalStyles);
}

module.exports = registration;
