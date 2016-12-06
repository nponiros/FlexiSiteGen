'use strict';

require('./e2e_test/test');

const Jasmine = require('jasmine');

const jasmine = new Jasmine();
jasmine.loadConfigFile('spec/support/jasmine.json');

jasmine.execute();
