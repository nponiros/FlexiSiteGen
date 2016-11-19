'use strict';

const templateProcessor = require('./../template_processors/pug_template');

const fileProcessor = require('./../helpers/file_processor');

const readers = require('./../plugins/helpers/readers');
const writers = require('./../plugins/helpers/writers');

const createPipeline = require('./../pipeline');
const initPipelineFns = require('./../pipeline_fns');

const DependencyGraph = require('./../dependency_graph');

const loadPlugins = require('./../load_plugins');
const initProcessorRegister = require('./../register_processor');
const internalPluginPaths = require('./../internal_plugins');

const genericContentProcessor = require('./../generic_content_processor/index');

const fs = require('fs');
const yaml = require('js-yaml');

function readFileToString(path, opts) {
  opts = opts || {encoding: 'utf8'};
  return fs.readFileSync(path, opts);
}


function generate(basePath, isProd) {
  const templatesPath = `${basePath}/templates`;

  const fileProcessors = new Map();

  function registerFileProcessor(name, extensions, processor) {
    const fileProcessor = {
      extensions,
      process: processor.process,
      minify: processor.minify
    };
    fileProcessors.set(name, fileProcessor);
  }

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
      content: genericContentProcessor
    }
  });

  const helpers = {};
  function registerHelper(type, name, init) {
    helpers[name] = init();
  }

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

  const processFile = fileProcessor(fileProcessors, generatorConfig.fileProcessors);
  // Offer direct access to individual processors
  for (let fileProcessor of fileProcessors.entries()) {
    const name = fileProcessor[0];
    processFile[name] = fileProcessor[1].process;
  }

  processorActions.forEach((action) => {
    graphs.get(action).calculateDependencies();
  });

  const siteConfig = processFile.yaml(readFileToString(`${basePath}/site_config.yml`));

  // Read all templates
  templateProcessor.read(`${templatesPath}`, helpers.readers);

  const pipeline = createPipeline();

  const helperFunctions = Object.assign({}, {processFile, renderTemplate: templateProcessor.renderTemplate}, helpers);

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
