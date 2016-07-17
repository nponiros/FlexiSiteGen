'use strict';

const path = require('path');

function read(basePath, readers) {
  const contentPaths = readers.dir(basePath);

  return contentPaths.map((contentPath) => {
    if (readers.isDir(contentPath)) {
      const directoryName = path.basename(contentPath);
      const contentFiles = readers.dir(contentPath);
      const files = contentFiles.map((file) => {
        const extension = path.extname(file);
        const fileName = path.basename(file, extension);
        return {
          fileName,
          filePath: file,
          stringContent: readers.fileToString(file)
        };
      });
      return {
        isDirectory: true,
        fileName: directoryName,
        files
      };
    } else {
      const extension = path.extname(contentPath);
      const fileName = path.basename(contentPath, extension);
      return {
        isDirectory: false,
        fileName,
        filePath: contentPath,
        stringContent: readers.fileToString(contentPath)
      };
    }
  });
}

module.exports = read;
