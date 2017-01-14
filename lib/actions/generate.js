'use strict';

const createPipeline = require('./../pipeline');
const initPipelineFns = require('./../pipeline_fns');

const initProcessorRegister = require('../register_functions/content_asset_decorator_processor');
const initFileProcessorRegister = require('../register_functions/file_processor');
const initTemplateProcessorRegister = require('../register_functions/template_processor');
const initHelperRegister = require('../register_functions/helper');

const genericFileProcessor = require('../generic_processors/file_processor');
const genericTemplateProcessor = require('../generic_processors/template_processor');
const genericContentProcessor = require('../generic_processors/content_processor');

const loadTemplates = require('../load_templates');

const DB = require('../db');

const loadConfigs = require('../load_configs');

const loadPlugins = require('../load_plugins');
const internalPluginPaths = require('../internal_plugins');

// doneFn is the last pipeline function. It's used for E2E tests
function generate(basePath, isProd = false, doneFn = (_, n) => { n(); }) {
  const db = new DB();
  db.set('basePath', basePath);

  const { generatorConfig, commonConfig, externalPluginPaths } = loadConfigs(basePath, isProd);

  const templatesPath = `${basePath}/${generatorConfig.template.common.path}`;

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
    commonConfig,
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
    helpers,
    basePath
  );

  const helperFunctions = Object.assign({}, {
    processFile,
    renderTemplate: processTemplate,
    processContent: genericContentProcessor,
  }, helpers);

  const pipeline = createPipeline();

  const pipelineFns = initPipelineFns(processors, callOrder, db, helperFunctions);
  pipeline.use(pipelineFns.processReaders);
  pipeline.use(pipelineFns.processPreprocessors);
  pipeline.use(pipelineFns.processTemplateVariables);
  pipeline.use(pipelineFns.processProcessors);
  pipeline.use(pipelineFns.processPostprocessors);
  pipeline.use(pipelineFns.processWriters);
  pipeline.use(doneFn);

  pipeline.execute(initialPipelineData);
}

module.exports = generate;
