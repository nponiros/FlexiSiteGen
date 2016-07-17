'use strict';

function process(contentWithLocals, contentType, renderTemplate, config) {
  return contentWithLocals.locals[contentType].map((current, i) => {
    const page = contentWithLocals[i];
    // current is the current page
    // locals contains all pages/posts other content types, site config
    const locals = Object.assign({}, contentWithLocals.locals, {current});
    const writePath = `${current.meta.url}${config.urlWithExtension ? '' : '.html'}`;
    const contentsToWrite = renderTemplate(current.meta.template || config.template, locals);
    return Object.assign(
      {},
      page,
      {
        writePath,
        contentsToWrite
      }
    );
  });
}

module.exports = process;
