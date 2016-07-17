const read = require('./read');
const preprocess = require('./preprocess');
const process = require('./process');
const postprocess = require('./postprocess');
const write = require('./write');

module.exports = {
  read,
  preprocess,
  process,
  postprocess,
  write
};
