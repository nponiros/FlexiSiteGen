#!/usr/bin/env node
'use strict';


const argv = require('yargs').argv;

const action = argv._[0];

const isProd = argv.prod;

const generate = require('../lib/generate.js');

const actions = {
  generate
};

const basePath = process.cwd();

if (actions[action]) {
  actions[action](basePath, isProd);
} else {
  console.log('Action', action, 'not supported');
}
