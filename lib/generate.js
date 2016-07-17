'use strict';

// File Processors
const markdownProcessor = require('./file_processors/markdown');
const yamlProcessor = require('./file_processors/yaml');
const jsonProcessor = require('./file_processors/json');
const htmlProcessor = require('./file_processors/html');

const templateProcessor = require('./template_processors/pug_template');

const fileProcessor = require('./file_processors/file_processor');

const readers = require('./readers');
const writers = require('./writers');

const createPipeline = require('./pipeline');
const initPipelineFns = require('./pipeline_fns');

const DependencyGraph = require('./dependency_graph');

const loadPlugins = require('./load_plugins');
const initProcessorRegister = require('./register_processor');
const internalPluginPaths = require('./internal_plugins');

const localHelpers = require('./locals_helpers/index');

const genericContentProcessor = require('./generic_content_processor/index');

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

  markdownProcessor(registerFileProcessor);
  yamlProcessor(registerFileProcessor);
  jsonProcessor(registerFileProcessor);
  htmlProcessor(registerFileProcessor);

  const generatorConfig = fileProcessors.get('yaml').process(readers.fileToString(`${basePath}/generator_config.yml`, {}));
  const globalConfig = Object.assign({styles: [], scripts: []}, generatorConfig.global);
  const externalPluginPaths = generatorConfig.plugins || [];

  // Add prod mode
  if (isProd !== undefined) {
    globalConfig.productionMode = isProd;
  }

  const processFile = fileProcessor(fileProcessors, generatorConfig.fileProcessors);
  // Offer direct access to individual processors
  for (let fileProcessor of fileProcessors.entries()) {
    const name = fileProcessor[0];
    processFile[name] = fileProcessor[1].process;
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

  loadPlugins(basePath, internalPluginPaths, externalPluginPaths).forEach((plugin) => {
    plugin(registerProcessor);
  });

  processorActions.forEach((action) => {
    graphs.get(action).calculateDependencies();
  });

  const siteConfig = processFile.yaml(readers.fileToString(`${basePath}/site_config.yml`));

  // Read all templates
  templateProcessor.read(`${templatesPath}`, readers);

  process.on('unhandledRejection', function (reason, p) {
    console.log('Possibly Unhandled Rejection at: Promise', p, 'reason:', reason);
  });

  const pipeline = createPipeline();
  const actionFns = {
    readers,
    renderTemplate: templateProcessor.renderTemplate,
    writers,
    processFile,
    localHelpers
  };
  const pipelineFns = initPipelineFns(graphs, siteConfig, actionFns);
  pipeline.use(pipelineFns.processReaders);
  pipeline.use(pipelineFns.processPreprocessors);
  pipeline.use(pipelineFns.processLocalCreators);
  pipeline.use(pipelineFns.processProcessors);
  pipeline.use(pipelineFns.processPostprocessors);
  pipeline.use(pipelineFns.processWriters);

  pipeline.execute(initialPipelineData);
}

module.exports = generate;
