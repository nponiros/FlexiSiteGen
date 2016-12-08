'use strict';

function init({
    processorConfig,
    processorCommonConfig,
    commonConfig,
}) {
  const config = Object.assign({}, commonConfig, processorCommonConfig, processorConfig);

  function templateVariables(tags, helperFns, db) {
    const createTagsFor = config.createTagsFor;
    return createTagsFor.reduce((map, contentName) => {
      const tagsLocal = {};
      db.get('templateVariables')[contentName].forEach((content) => {
        if (content.meta.tags) {
          content.meta.tags = content.meta.tags.map((tag) => {
            if (tagsLocal[tag]) { // Used in a tags list to display all tags
              tagsLocal[tag].contents.push(content);
            } else {
              tagsLocal[tag] = {
                label: tag,
                url: `tags#${tag.replace(' ', '-')}`,
                id: tag.replace(' ', '-'),
                contents: [content],
              };
            }
            return { // Replace the tag string of the content with an object
              label: tag,
              url: `tags#${tag.replace(' ', '-')}`,
            };
          });
        } else { // Add empty array so we don't have to check in the template if tags are here before iterating
          content.meta.tags = [];
        }
      });
      return Object.assign({}, map, { [contentName]: Object.keys(tagsLocal).map((key) => tagsLocal[key]) });
    }, {});
  }

  return {
    templateVariables,
  };
}

const type = 'decorator';
const name = 'tags';
function registration(register) {
  register(type, name, init);
}
module.exports = registration;
