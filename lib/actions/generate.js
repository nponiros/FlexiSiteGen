'use strict';

const createPipeline = require('./../pipeline');
const initPipelineFns = require('./../pipeline_fns');

const loadPlugins = require('../load_plugins');
const internalPluginPaths = require('../internal_plugins');

const initProcessorRegister = require('../register_functions/content_asset_decorator_processor');
const initFileProcessorRegister = require('../register_functions/file_processor');
const initTemplateProcessorRegister = require('../register_functions/template_processor');
const initHelperRegister = require('../register_functions/helper');

const genericFileProcessor = require('../generic_processors/file_processor');
const genericTemplateProcessor = require('../generic_processors/template_processor');
const genericContentProcessor = require('../generic_processors/content_processor');

const loadTemplates = require('../load_templates');

const defaultConfig = require('../default_config');

const fs = require('fs');
const yaml = require('js-yaml');

const extendify = require('extendify');
const extend = extendify({
  inPlace: false,
  arrays: 'replace',
});

const DB = require('../db');

function readFileToString(path, opts) {
  opts = opts || { encoding: 'utf8' };
  return fs.readFileSync(path, opts);
}

function generate(basePath, isProd) {
  const db = new DB();

  const userConfig = yaml.safeLoad(readFileToString(`${basePath}/generator_config.yml`, {}));
  const generatorConfig = extend({}, defaultConfig, userConfig);
  const globalConfig = extend(defaultConfig.global, generatorConfig.global);
  const externalPluginPaths = generatorConfig.plugins || [];

  const templatesPath = `${basePath}/${generatorConfig.template.path}`;

  // Add prod mode
  if (isProd !== undefined) {
    globalConfig.productionMode = isProd;
  }

  // Initialize processors
  const fileProcessors = new Map();
  const registerFileProcessor = initFileProcessorRegister({ fileProcessors });

  const helpers = {};
  const registerHelper = initHelperRegister({ helpers });

  const templateProcessors = new Map();
  const registerTemplateProcessor = initTemplateProcessorRegister({ templateProcessors });

  const processors = new Map();

  const initialPipelineData = {};

  const callOrder = [];
  const registerProcessor = initProcessorRegister({
    generatorConfig,
    globalConfig,
    initialPipelineData,
    processors,
    callOrder,
    basePath,
  });

  function registerPlugin(type, ...args) {
    if (type === 'file') {
      registerFileProcessor(...args);
    } else if (type === 'helper') {
      registerHelper(...args);
    } else if (type === 'template') {
      registerTemplateProcessor(...args);
    } else {
      registerProcessor(type, ...args);
    }
  }

  loadPlugins(basePath, internalPluginPaths, externalPluginPaths).forEach((plugin) => {
    plugin(registerPlugin);
  });

  const templates = new Map();
  loadTemplates(templatesPath, templates, helpers.readers);

  const processFile = genericFileProcessor(fileProcessors, generatorConfig.file, helpers);
  const processTemplate = genericTemplateProcessor(
    templateProcessors,
    templates,
    generatorConfig.template,
    helpers
  );

  const helperFunctions = Object.assign({}, { processFile, renderTemplate: processTemplate, processContent: genericContentProcessor }, helpers);

  const pipeline = createPipeline();

  const pipelineFns = initPipelineFns(processors, callOrder, db, helperFunctions);
  pipeline.use(pipelineFns.processReaders);
  pipeline.use(pipelineFns.processPreprocessors);
  pipeline.use(pipelineFns.processTemplateVariables);
  pipeline.use(pipelineFns.processProcessors);
  pipeline.use(pipelineFns.processPostprocessors);
  pipeline.use(pipelineFns.processWriters);

  pipeline.execute(initialPipelineData);
}

module.exports = generate;
