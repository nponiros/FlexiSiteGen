[![Code Climate](https://codeclimate.com/github/codeclimate/codeclimate/badges/gpa.svg)](https://codeclimate.com/github/codeclimate/codeclimate)

# FlexiSiteGen

A flexible, configurable static website generator using pug (used to be jade) templates.

This software ist still very much experimental and might break at any time. Use with caution.

## Installation

The tool can be installed via [npm](https://www.npmjs.com/). Be aware that the tool needs [Node.js](https://nodejs.org/en/) versions greater than 6.0.0. It might work with earlier versions especially if combined with [babel](https://babeljs.io/) but it was never tested with a version older than 6.0.0.

To gloabally install the tool:

```bash
npm install -g flexi-site-gen
```

## Basic usage

```bash
flexi-site-gen init
```

The command creates a dummy site in the directory in which it is called in. Make sure the directory is empty. If it is not empty no dummy site will be generated.

```bash
flexi-site-gen generate
```

Calling the above command in the directory with the dummy site will build it. The result will be in the `public` folder. Now you can use any webserver to serve the website.

## CLI

### init

```bash
flexi-site-gen init
```

Creates a dummy site to help you get started with the tool.

### generate

```bash
flexi-site-gen generate
```

Generates the website outputing all needed files into the directory specified with the `publicDir` property. Per default the generated site can be found in the `public` directory.

__Flags__

```
--prod
```

Calls all plugins with `productionMode` set to __true__. The exact behavior of the generator depends on what each plugin does when the `productionMode` property is set.

## Built-in File Processors

* html
* json
* markdown
* yaml

### html

Front-Matter support: true
Sections support: true
Section splitter: <!---- ---->

### markdown

Front-Matter support: true
Sections support: true
Section splitter:  --- ---

### json

Front-Matter support: false
Sections support: false

### yaml

Front-Matter support: false
Sections support: false

## Built-in Template Processors

* pug (used to be jade)

## Built-in Content Processors

* pages
* posts

### pages


### posts


## Built-in Asset Processors

* images
* scripts
* styles
* fonts

### images

### scripts

### styles

### fonts

## Built-in Decorators

* tags
* sitemap
* pagination

### tags

### archive

### pagination

## Plugins

Content processors, asset processors and decorators are all considered plugins.
Besides the internal plugins which are part of the generator, you can create your own plugins.
In order to use one of your plugins, you have to give its path to the `plugins` property in the generator's config file.
If you define a plugin having the same name as an internal plugin then yours will take precedence.

## TODOs

* Add more unit tests
* Add more documentation
