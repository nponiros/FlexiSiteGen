#!/usr/bin/env node

'use strict';

const argv = require('yargs').argv;

const action = argv._[0];

const isProd = argv.prod;

const generate = require('../lib/actions/generate');
const init = require('../lib/actions/init');

const actions = {
  generate,
  init,
};

const basePath = process.cwd();

process.on('unhandledRejection', (reason, p) => {
  console.log('Possibly Unhandled Rejection at: Promise', p, 'reason:', reason);
});

if (actions[action]) {
  actions[action](basePath, isProd);
} else {
  console.log('Action', action, 'not supported');
}
