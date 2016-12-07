'use strict';

const path = require('path');
const imagemin = require('imagemin');

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig,
}) {
  const config = Object.assign({}, globalConfig, processorGlobalConfig, processorConfig);

  function read(basePath, { readers }) {
    const imagePaths = readers.dir(`${basePath}`);
    return imagePaths.map((imagePath) => ({
      id: path.basename(imagePath),
      name: path.basename(imagePath),
      path: imagePath,
      contents: readers.fileToBuffer(imagePath),
      extension: path.extname(imagePath),
    }));
  }

// image has name, path
  function preprocess(images) {
    return images.map((image) => {
      const next = Object.assign({}, image);
      next.writePath = `images/${image.name}`;
      return next;
    });
  }

  function minify(contents, ext, opts) {
    if (opts[ext]) {
      const pluginPath = path.resolve(config.basePath, 'node_modules', `imagemin-${opts[ext].plugin}`);
      return imagemin.buffer(contents, {
        plugins: [require(pluginPath)(opts[ext].opts)],
      });
    }
    return Promise.resolve(contents);
  }

// image has name, path, writePath
  function postprocess(images) {
    return Promise.all(images.map((image) => {
      if (config.productionMode) {
        return minify(image.contents, image.extension, config.minify)
          .then((contents) => {
            image.contents = contents;
            return image;
          });
      }
      return Promise.resolve(image);
    }));
  }

// image has name, path, writePath
  function write(images, { writers }) {
    images.forEach((image) => {
      const outputPath = `${config.outputDir}/${image.writePath}`;
      writers.file(outputPath, image.contents);
    });
  }

  return {
    read,
    preprocess,
    postprocess,
    write,
  };
}

const type = 'asset';
const name = 'images';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
