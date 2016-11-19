'use strict';

const templateProcessor = require('./../template_processors/pug_template');

const genericFileProcessor = require('./../generic_processors/file_processor');

const createPipeline = require('./../pipeline');
const initPipelineFns = require('./../pipeline_fns');

const DependencyGraph = require('./../dependency_graph');

const loadPlugins = require('./../load_plugins');
const internalPluginPaths = require('./../internal_plugins');

const initProcessorRegister = require('./../register_functions/content_asset_decorator_processor');
const initFileProcessorRegister = require('./../register_functions/file_processor');
const initTemplateProcessorRegister = require('./../register_functions/template_processor');
const initHelperRegister = require('./../register_functions/helper');

const genericContentProcessor = require('./../generic_processors/content_processor');

const fs = require('fs');
const yaml = require('js-yaml');

function readFileToString(path, opts) {
  opts = opts || {encoding: 'utf8'};
  return fs.readFileSync(path, opts);
}

function generate(basePath, isProd) {
  const templatesPath = `${basePath}/templates`;

  const fileProcessors = new Map();

  const registerFileProcessor = initFileProcessorRegister({
    fileProcessors,
  });

  const generatorConfig = yaml.safeLoad(readFileToString(`${basePath}/generator_config.yml`, {}));
  const globalConfig = Object.assign({styles: [], scripts: []}, generatorConfig.global);
  const externalPluginPaths = generatorConfig.plugins || [];

  // Add prod mode
  if (isProd !== undefined) {
    globalConfig.productionMode = isProd;
  }

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

  const helpers = {};
  const registerHelper = initHelperRegister({ helpers });

  function registerPlugin(type, ...args) {
    if (type === 'file') {
      registerFileProcessor(...args);
    } else if (type === 'helper') {
      registerHelper(type, ...args);
    } else {
      registerProcessor(type, ...args);
    }
  }

  loadPlugins(basePath, internalPluginPaths, externalPluginPaths).forEach((plugin) => {
    plugin(registerPlugin);
  });

  const processFile = genericFileProcessor(fileProcessors, generatorConfig.fileProcessors, helpers);

  processorActions.forEach((action) => {
    graphs.get(action).calculateDependencies();
  });

  const siteConfig = processFile.yaml(readFileToString(`${basePath}/site_config.yml`));

  // Read all templates
  templateProcessor.read(`${templatesPath}`, helpers.readers);

  const helperFunctions = Object.assign({}, {processFile, renderTemplate: templateProcessor.renderTemplate}, helpers);

  const pipeline = createPipeline();

  const pipelineFns = initPipelineFns(graphs, siteConfig, helperFunctions);
  pipeline.use(pipelineFns.processReaders);
  pipeline.use(pipelineFns.processPreprocessors);
  pipeline.use(pipelineFns.processLocalCreators);
  pipeline.use(pipelineFns.processProcessors);
  pipeline.use(pipelineFns.processPostprocessors);
  pipeline.use(pipelineFns.processWriters);

  pipeline.execute(initialPipelineData);
}

module.exports = generate;
