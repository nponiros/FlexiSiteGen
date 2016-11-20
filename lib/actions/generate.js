'use strict';

const createPipeline = require('./../pipeline');
const initPipelineFns = require('./../pipeline_fns');

const DependencyGraph = require('../dependency_graph');

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
  opts = opts || {encoding: 'utf8'};
  return fs.readFileSync(path, opts);
}

function generate(basePath, isProd) {
  const db = new DB();

  const userConfig = yaml.safeLoad(readFileToString(`${basePath}/generator_config.yml`, {}));
  const generatorConfig = extend({}, defaultConfig, userConfig);
  const globalConfig = extend(defaultConfig.global, generatorConfig.global);
  const externalPluginPaths = generatorConfig.plugins || [];

  const templatesPath = `${basePath}/${generatorConfig.templateProcessors.path}`;

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

  const graphs = new Map();
  const processorActions = ['read', 'preprocess', 'createLocals', 'process', 'postprocess', 'write'];
  processorActions.forEach((action) => {
    graphs.set(action, new DependencyGraph());
  });

  const initialPipelineData = {};

  const registerProcessor = initProcessorRegister({
    generatorConfig,
    globalConfig,
    initialPipelineData,
    processorActions,
    graphs,
    basePath,
    processors: {
      content: genericContentProcessor,
    },
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

  const processFile = genericFileProcessor(fileProcessors, generatorConfig.fileProcessors, helpers);
  const processTemplate = genericTemplateProcessor(
    templateProcessors,
    templates,
    generatorConfig.templateProcessors,
    helpers
  );

  // This needs to be here
  processorActions.forEach((action) => {
    graphs.get(action).calculateDependencies();
  });

  const helperFunctions = Object.assign({}, { processFile, renderTemplate: processTemplate }, helpers);

  const pipeline = createPipeline();

  const pipelineFns = initPipelineFns(graphs, db, helperFunctions);
  pipeline.use(pipelineFns.processReaders);
  pipeline.use(pipelineFns.processPreprocessors);
  pipeline.use(pipelineFns.processLocalCreators);
  pipeline.use(pipelineFns.processProcessors);
  pipeline.use(pipelineFns.processPostprocessors);
  pipeline.use(pipelineFns.processWriters);

  pipeline.execute(initialPipelineData);
}

module.exports = generate;
