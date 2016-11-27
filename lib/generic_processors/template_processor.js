'use strict';

// defaultOpts -> configured in generator config
function init(templateProcessors, templates, defaultOpts, helpers) {
  function processTemplate(templateName, templateVariables, opts) {
    if (templates.has(templateName)) {
      const templateObject = templates.get(templateName);
      for (const [processorName, processor] of templateProcessors.entries()) {
        const extIndex = processor.extensions.indexOf(templateObject.ext);
        if (extIndex !== -1) {
          const mergedOptions = Object.assign(
            { filenameWithPath: `${process.cwd()}/${defaultOpts.path}/${templateName}${templateObject.ext}` },
            defaultOpts.global,
            defaultOpts[processorName],
            opts
          );
          return processor.process(templateObject.template, mergedOptions, templateVariables, helpers);
        }
      }
      throw new Error(`No template processor found for extension: ${templateObject.ext}.`);
    } else {
      throw Error(`Template: "${templateName}" does not exist`);
    }
  }

  // Offer direct access to individual processors
  for (const [name, fn] of templateProcessors.entries()) {
    processTemplate[name] = fn.process;
  }

  return processTemplate;
}

module.exports = init;
