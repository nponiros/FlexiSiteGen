'use strict';

const path = require('path');
const Imagemin = require('imagemin');

function init({
    processorConfig,
    processorGlobalConfig,
    globalConfig
}) {
  const config = Object.assign({}, globalConfig, processorGlobalConfig, processorConfig);

  function read(basePath, { readers }) {
    const imagePaths = readers.dir(`${basePath}`);
    const images = imagePaths.map((imagePath) => {
      return {
        id: path.basename(imagePath),
        name: path.basename(imagePath),
        path: imagePath,
        contents: readers.fileToBuffer(imagePath),
        extension: path.extname(imagePath)
      };
    });
    return images;
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
    opts = opts || {};
    const imagemin = new Imagemin().src(contents);

    let result;
    switch (ext) {
      case '.gif':
        result = imagemin.use(Imagemin.gifsicle(opts.gif));
        break;
      case '.jpg':
      case '.jpe':
      case '.jif':
      case '.jfif':
      case '.jfi':
      case '.jpeg':
        result = imagemin.use(Imagemin.jpegtran(opts.jpeg));
        break;
      case '.png':
        result = imagemin.use(Imagemin.optipng(opts.png));
        break;
      case '.svg':
        result = imagemin.use(Imagemin.svgo(opts.svg));
        break;
      default:
        result = contents;
    }
    return result;
  }

// image has name, path, writePath
  function postprocess(images) {
    return images.map((image) => {
      if (config.productionMode) {
        image.contents = minify(image.contents, image.extension, config.minify);
      }
      return image;
    });
  }

// image has name, path, writePath
  function write(images, { writers }) {
    images.forEach((image) => {
      const outputPath = `${config.outputDir}/${image.writePath}`;
      if (config.productionMode) {
        image.contents.dest(outputPath);
      } else {
        writers.file(outputPath, image.contents);
      }
    });
  }

  return {
    read,
    preprocess,
    postprocess,
    write
  };
}

const type = 'asset';
const name = 'images';
function registration(register) {
  register(type, name, init);
}

module.exports = registration;
