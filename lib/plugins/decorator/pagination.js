'use strict';

const update = require('immutability-helper');

function init({
    processorConfig,
    processorCommonConfig,
    commonConfig,
}) {
  const config = Object.assign({}, commonConfig, processorCommonConfig, processorConfig);

  function chunk(originalArray, chunkSize) {
    const chunksArray = [];
    for (let i = 0; i < originalArray.length; i += chunkSize) {
      chunksArray.push(originalArray.slice(i, i + chunkSize));
    }
    return chunksArray;
  }

  function createControls(index, numOfPages, urls) {
    return [...Array(numOfPages).keys()].map((_, i) => ({
      label: String(i + 1),
      isActive: index === i,
      url: `${urls[i]}${config.urlWithExtension ? '.html' : ''}`,
    }));
  }

  function preprocess(pagination, helperFns, db) {
    const paginationArray = config.paginate;

    return paginationArray.reduce((map, paginationConfig) => {
      const {
          paginationPage: nameOfPaginationPage,
          contentToPaginate: nameOfContentToPaginate,
          contentPerPage,
      } = paginationConfig;

      const contentToPaginate = db.get('preprocess')[nameOfContentToPaginate];
      const paginationPage = db.get('preprocess').pages.object[nameOfPaginationPage];

      const chunks = chunk(contentToPaginate.map((content) => content.id), contentPerPage);
      const numOfChunks = chunks.length;

      const newPages = [];
      const urls = [paginationPage.meta.url || paginationPage.fileName];
      for (let i = 2; i <= numOfChunks; i++) {
        // Create new pages. The URLs for these pages will be take care of by the pages processor
        const newPage = update(paginationPage, {
          id: { $set: `${paginationPage.id}_pagination${i}` },
          fileName: { $set: `${paginationPage.fileName}_${i}` },
          meta: {
            $merge: {
              url: `${urls[0]}_${i}`,
              title: `${paginationPage.meta.title || ''}`,
            },
          },
        });
        // Urls for the pages. Will be used when creating the controls
        urls.push(`${urls[0]}_${i}`);
        newPages.push(newPage);
      }

      db.get('preprocess').pages.push(...newPages);
      Object.assign(
          db.get('preprocess').pages.object,
          newPages.reduce((map, cur) => Object.assign({}, map, { [cur.id]: cur }), {})
      );

      return Object.assign({}, map, {
        [nameOfContentToPaginate]: {
          numOfPages: numOfChunks,
          chunks, // contains nested array of IDs
          urls,
        },
      });
    }, {});
  }

  function templateVariables(pagination, helperFns, db) {
    const paginationArray = config.paginate;

    paginationArray.forEach((paginationConfig) => {
      const {
          paginationPage: nameOfPaginationPage,
          contentToPaginate: nameOfContentToPaginate,
      } = paginationConfig;

      const numOfPages = pagination[nameOfContentToPaginate].numOfPages;
      const paginationIds = [nameOfPaginationPage];
      for (let i = 2; i <= numOfPages; i++) {
        paginationIds.push(`${nameOfPaginationPage}_pagination${i}`);
      }

      paginationIds.forEach((id, index) => {
        const page = db.get('templateVariables').pages.object[id];
        // Ref of page in object is same as in array -> use that to avoid updating both
        page.pagination = {
          controls: createControls(index, numOfPages, pagination[nameOfContentToPaginate].urls),
          [nameOfContentToPaginate]: pagination[nameOfContentToPaginate].chunks[index].map(
              (chunkId) => db.get('templateVariables')[nameOfContentToPaginate].object[chunkId]
          ),
          currentPageNumber: index + 1,
          numOfPages,
        };
      });
    }, {});
    return pagination;
  }

  return {
    preprocess,
    templateVariables,
  };
}

const type = 'decorator';
const name = 'pagination';
function registration(register) {
  register(type, name, init);
}
module.exports = registration;
