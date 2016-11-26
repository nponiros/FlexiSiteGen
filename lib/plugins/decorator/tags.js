'use strict';

function init() {
  function templateVariables(tags, helperFns, db) {
    const tagsLocal = {};
    db.get('templateVariables').posts.forEach((post) => {
      if (post.meta.tags) {
        post.meta.tags = post.meta.tags.map((tag) => {
          if (tagsLocal[tag]) { // Used in a tags list to display all tags
            tagsLocal[tag].posts.push(post);
          } else {
            tagsLocal[tag] = {
              label: tag,
              url: `tags#${tag.replace(' ', '-')}`,
              id: tag.replace(' ', '-'),
              posts: [post]
            };
          }
          return { // Replace the tag string of the post with an object
            label: tag,
            url: `tags#${tag.replace(' ', '-')}`
          };
        });
      } else { // Add empty array so we don't have to check in the template if tags are here before iterating
        post.meta.tags = [];
      }
    });
    return Object.keys(tagsLocal).map((key) => tagsLocal[key]);
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
