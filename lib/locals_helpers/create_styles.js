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

module.exports = createLocalStyles;
