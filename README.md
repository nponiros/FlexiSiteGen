[![Code Climate](https://codeclimate.com/github/codeclimate/codeclimate/badges/gpa.svg)](https://codeclimate.com/github/codeclimate/codeclimate)
[![Build Status](https://travis-ci.org/nponiros/FlexiSiteGen.svg?branch=master)](https://travis-ci.org/nponiros/FlexiSiteGen)

# FlexiSiteGen

A flexible, configurable static website generator using pug (used to be called jade) templates.

This software ist still very much experimental and might break at any time. Use with caution.

## Table of contents

* [Why yet another static site generator](#why-yet-another-static-site-generator)
* [Installation](#installation)
* [Usage](#usage)
* [CLI](#cli)
* [Overview](#overview)
* [Adding new content](#adding-new-content)
* [Using front-matter](#using-front-matter)
* [Built-in Processors](#built-in-processors)

## Why yet another static site generator

First off let my try to explain why I wrote this tool and why it might be exactly what you are looking for.

I wanted something that I configure to my needs especially when it comes to optimizing the assets downloaded by the browser. The main reason for writing this tool is to allow the user to exactly define the scripts and styles downloaded by the browser for each and every page.

A further reason to write this tool was to allow its extention it without having to write npm modules for it. A plugin is a function and you can decide if want to use npm (or any other way) to publish it.

A further aspect which I think make the tool unique is that you as user can add new contents to it. Pages and posts are included by default but you can override those by adding your own plugin or you can define new contents by writing a plugin. Of course you can override any built-in pluging by defining your own.

## Installation

The tool can be installed via [npm](https://www.npmjs.com/). Be aware that the tool needs [Node.js](https://nodejs.org/en/) versions greater than 6.0.0. It might work with earlier versions especially if combined with [babel](https://babeljs.io/) but it was never tested with a version older than 6.0.0.

```bash
npm install -g flexi-site-gen
```

## Usage

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

Generates the website writing all files into the directory specified with the `publicDir` property. Per default the generated site can be found in the `public` directory.

__Flags__

```
--prod
```

Calls all plugins with `productionMode` set to __true__. The exact behavior of the generator depends on what each plugin does when the `productionMode` property is set.

## Overview

The tool differentiates between 5 types of processors, asset, content, decorator, file and template.

__Assets__: Assets are things you can use in page of the website but are not necessarily part of the content. Images, fonts, scripts and styles are considered assets.

__Content__: The contents of the content folder will be used to create individual pages for your site.

__Decorator__: Decorators are used to add more features to your content. For example the sitemap decorator can create a sitemap.xml file based on the pages and posts of your site.

__File__: Depending on the extension used for the content files, the needed file processor is called to parse the file.

__Template__: When you generate your site, the templates are used and define the final output for the individual html files. The content of each page, posts etc. are combined with a template and this is what is later wrote as an html page. [Pug (used to be called jade)](https://pugjs.org/api/getting-started.html) is used per default to process the templates. The selected template processor depends on the template file extension.

__generator\_config.yml__: Configuration file for the tool. Here you can configure, for example, the active processors. The configuration file is written in [YAML](http://www.yaml.org/start.html).

## Adding new content

This section shows you the ways you can write new content for your webpage. What is written here holds true for the built-in contents (pages/posts). 3rd-Party content plugins might allow other ways of writing content.

The easiest way to add new content, is to add an HTML or Markdown file into content->pages or content->posts. Each page has (optional) meta data and content. During generation you can use those in your templates. When using an individual file for your content you can use [front-matter](#using-front-matter) to define the meta data (see [about.html](./init_site/content/pages/about.html) and [index.html](./init_site/content/pages/index.html)). Any meta data you define, can be used in the templates. Anything below the front-matter is considered to be the contents of the page.

### Example

__Page__ (uses the html file processor):

```html
---
title: 'Dummy page'
---

<p>Page contents</p>
```

__Template__ (uses the pug template processor):

```pug
doctype html
html(lang="en")
  head
    title=current.meta.title
  body
    h1=current.meta.title
    !{current.content.content}
```

* `current` is the current page, post etc.
* `current.meta` is an object containing all front-matter attributes
* `current.content` is an object with all content. Per default you can use `current.content.content` to access the actual content. If sections are used then `current.content` contains the section names as properties

__Result__:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Dummy page</title>
  </head>
  <body>
    <h1>Dummy page</h1>
    <p>Page contents</p>
  </body>
</html>     
```

## Using front-matter

Front-matter is a block of [YAML](http://www.yaml.org/start.html) at the beginning of a file. To parse it, the generator uses [front-matter](https://www.npmjs.com/package/front-matter) npm package.

When you add new content by using only one file (front-matter is not supported if you use multiple files for a page, see [blog1](./init_site/content/posts/blog1)), you can use front-matter to define meta data for each file. Meta data are optional but there might be content processors requiring some specific meta data attributes. For example the page content processor can use the `url` attribute in the meta data to define the URL and the output path for the page.

### Example

```html
---
title: 'Foo bar'
---
```

It is important to place your front-matter attributes between `---` and `---` and it needs to be the first thing in the file.

## Built-in Processors

### File Processors

The file processors are called for each file in the content folders. Which processor is called depends on the extension of the file. You can configure the file processor in the generator configuration file. Use `file` as key (see below for examples for the individual file processor).

Built-in file processors:

* html
* json
* markdown
* yaml

Below you can find more information about the individual file processors.

#### html

* Extensions: .html, .htm
* Front-Matter support: true
* Sections support: true
* Section splitter: <!-SectionName-->
* Configuration: N/A

#### json

* Extensions: .json
* Front-Matter support: false
* Sections support: false
* Configuration: N/A

#### markdown

* Extensions: .markdown, .mdown, .mkdn, .md, .mkd, .mdwn, .mdtxt, .mdtext
* Front-Matter support: true
* Sections support: true
* Section splitter:  ---SectionName---
* Uses [markdown-it](https://www.npmjs.com/package/markdown-it)
* Configuration: you can use the options allowed by markdown-it
  * The `highlight` option is not supported. Use `codeHighlight: true` instead. When this is used highlighting will be enabled using [highlight.js](https://highlightjs.org/)
* Default configuration: The default configuration for markdown-it

##### Configuration example

```YAML
file:
  markdown:
    html: true
    codeHighlight: true
```

#### yaml

* Extensions: .yaml, .yml
* Front-Matter support: false
* Sections support: false
* Uses: [js-yaml](https://github.com/nodeca/js-yaml) with `safeLoad`
* Configuration: currently not supported

### Template Processors

* pug (used to be jade)

### Content Processors

* pages
* posts

### Asset Processors

* images
* scripts
* styles
* fonts

### Decorators

* tags
* sitemap
* pagination

## Plugins

Content processors, asset processors and decorators are all considered plugins.
Besides the internal plugins which are part of the generator, you can create your own plugins.
In order to use one of your plugins, you have to give its path to the `plugins` property in the generator's config file.
If you define a plugin having the same name as an internal plugin then yours will take precedence.

## TODOs

* Add more unit tests
* Add more documentation

## Contributing

If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please open an [issue](https://github.com/nponiros/FlexiSiteGen/issues) or [pull request](https://github.com/nponiros/FlexiSiteGen/pulls).
If you have any questions feel free to open an [issue](https://github.com/nponiros/GlexiSiteGen/issues) with your question.

## License

[MIT License](./LICENSE)
