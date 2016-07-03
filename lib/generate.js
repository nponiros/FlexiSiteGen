'use strict';

// Content Processors
const pageProcessor = require('./content_processors/pages');
const postProcessor = require('./content_processors/posts');

// File Processors
const markdownProcessor = require('./file_processors/markdown');
const yamlProcessor = require('./file_processors/yaml');
const jsonProcessor = require('./file_processors/json');
const htmlProcessor = require('./file_processors/html');

// Asset Processors
const scriptsProcessor = require('./asset_processors/scripts');
const stylesProcessor = require('./asset_processors/styles');
const fontsProcessor = require('./asset_processors/fonts');
const imagesProcessor = require('./asset_processors/images');

const templateProcessor = require('./template_processors/pug_template');

const fileProcessor = require('./file_processors/file_processor');

const readers = require('./readers');
const writers = require('./writers');

// Decorators
const tagsDecorator = require('./decorators/tags');
const archiveDecorator = require('./decorators/archive');
const sitemapDecorator = require('./decorators/sitemap');

const createPipeline = require('./pipeline');
const initPipelineFns = require('./pipeline_fns');

const DependencyGraph = require('./dependency_graph');

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
  const globalConfig = generatorConfig.global;

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

  function noopAction(data) {
    return data;
  }

  function registerProcessor(type, name, dependsOn, initFn) {
    let processor;
    const processorsConfig = generatorConfig[type + 'Processors'];
    const processorConfig = processorsConfig && generatorConfig[type + 'Processors'][name];
    const processorGlobalConfig = processorsConfig && generatorConfig[type + 'Processors'].global;
    const activeProcessors = processorsConfig && processorsConfig.active;

    if (activeProcessors && activeProcessors.indexOf(name) !== -1) {
      processor = initFn(processorConfig, processorGlobalConfig, globalConfig);
      const path = `${basePath}/${processorsConfig.path}/${name}`;
      initialPipelineData[name] = path;

      processorActions.forEach((action) => {
        // Only the first processor with a given name is considered
        graphs.get(action).addNode(name, processor[action] || noopAction, dependsOn);
      });
    }
  }

  scriptsProcessor(registerProcessor);
  stylesProcessor(registerProcessor);
  fontsProcessor(registerProcessor);
  imagesProcessor(registerProcessor);

  pageProcessor(registerProcessor);
  postProcessor(registerProcessor);

  tagsDecorator(registerProcessor);
  archiveDecorator(registerProcessor);
  sitemapDecorator(registerProcessor);

  processorActions.forEach((action) => {
    graphs.get(action).calculateDependencies();
  });

  const siteConfig = processFile.yaml(readers.fileToString(`${basePath}/site_config.yml`));

  // Read all templates
  templateProcessor.read(`${templatesPath}`, readers);

  process.on('unhandledRejection', function(reason, p) {
    console.log('Possibly Unhandled Rejection at: Promise', p, 'reason:', reason);
  });

  const pipeline = createPipeline();
  const actionFns = {
    readers,
    renderTemplate: templateProcessor.renderTemplate,
    writers,
    processFile
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
