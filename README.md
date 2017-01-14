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
* [Configuration](#configuration)
* [Built-in Processors](#built-in-processors)
  * [File Processors](#file-processors)
  * [Template Processors](#template-processors)
  * [Content Processors](#content-processors)
  * [Asset Processors](#asset-processors)
  * [Decorators](#decorators)
* [Contributing](#contributing)
* [License](#license)

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

## Configuration

The configuration for the tool can be found in the `generator_config.yml` file.

There are different levels of configuration each with a different priority. The different levels are:

1) configuration for a processor type and a concrete processor in generator\_config.yml, for example for the markdown file processor
2) common configuration for a processor type in generator\_config.yml, for example for all file processors
3) common configuration for all processors in generator\_config.yml

The order above also defines the precedence order for the built-in processors. If for example you define the same key in the common configuration and the configuration for the processor, then the value of the processor configuration will  be used.

Please note that in the end each processor defines which options it will use, if it will consider options set in individual content files (meta data) and if it wants to honor the precedence order defined here. Also the processor defines how exactly the keys of the various configuration levels will be merged if the key points to an object or array.

In some cases you can also configure a processor using the meta data of a file. As above the processor defines what it does with the data. See each processor for more information on how it handles the configuration.

__Default configuration file__

```YAML
common:
  outputDir: 'public' # Directory in which the site will be generated
template:
  common:
    path: 'templates' # Path where the templates are saved
  pug:
    pretty: true
asset:
  common:
    path: 'assets' # path to assets
  styles:
    postcss:
      plugins:
        prod:
          - name: 'cssnano' # Used during production mode to minify the CSS
content:
  common:
    path: 'content' # path to content
  global:
    urlWithExtension: false # Don't use .html as extension for the URLs
    htmlmin: # Used during production mode to minify the HTML
      removeAttributeQuotes: true
      collapseWhitespace: true
  posts:
    urlFormat: ':year/:month/:day/:name/'
```

## Built-in Processors

### File Processors

The file processors are called for each file in the content folders. Which processor is called depends on the extension of the file. You can configure the file processor in the generator configuration file. Use `file` as key (see below for examples for the individual file processor). File processors are activated by default.

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

The template processors are used for the files in the templates folder. Depending on the extension the correct processor is called. You can use the `template` key to configure them. Template processors are activated by default.

#### Common configuration

```YAML
template:
  common:
    path: 'templates' # Path where the templates are saved
```

Built-in template processors:

* pug (used to be jade)

#### pug

* Extensions: .pug
* Uses: [pug](https://pugjs.org/api/getting-started.html)
* Configuration: you can use the options allowed by pug
  * The `filename` option is automatically set
* Default configuration: `pretty: true`

##### Configuration example
     
```YAML
template:
  pug:
    pretty: true
```

### Content Processors

The content processors are used for files/folders in the content folder. Content processors are deactivated by default and need to be explicitly activated using the `active` key in the configuration file.

#### Common configuration

```YAML
content:
  active: # Activate the pages and posts content processors
    - 'pages'
    - 'posts'
  common:
    path: 'content' # Path where the contents are saved
```

Built-in content processors:

* pages
* posts

#### pages

Can be used to create individual pages. Uses [htmlmin](https://www.npmjs.com/package/htmlmin) in production mode for minification.

##### Configuration

__generator\_config.yml__

```YAML
content:
  pages:
    template: 'page'       # The template for all pages
    scripts:               # scripts for all pages. Requires the scripts asset processor
      - name: 'script.js'
        opts:              # Options for this script
          async: true
    styles:                # styles for all pages. Requires the styles asset processor
      - name: 'styles.css' 
        opts:              # Options for this style
          media: 'all'
    htmlmin:               # HTML minification for production mode. You can specify more htmlmin options if you want
      removeAttributeQuotes: true,
      collapseWhitespace: true,
```

__File meta data__

* __url__: Defines the URL to be used for the page. If not specified the file/folder name is used
* __template__: Defines the template to be used for this page. If not specified the `template` in generator\_config.yml is used
* __scripts__: Same format as above. If scripts are defined in the configuration file and the meta data then those are concatenated. If the same name is defined multiple times, the last definition is used
* __styles__: Same format as above. If styles are defined in the configuration file and the meta data then those are concatenated. If the same name is defined multiple times, the last definition is used

##### Template variables

* __current__: Object for the current page
  * __content__: Object containing the page content. If no sections are used `content.content` is all content of the file minus meta data
  * __meta__: Object containing all page meta data
  * __styles__: Array of all styles for this page
  * __scripts__: Array of all the scripts for this page
* __pages__: Array containing all pages. Each page is an object with the same attributes as `current`

#### posts

Can be used to create a blog. The main blog page is defined using `pages` and the individual blog posts are defined using the `posts` content processor. Uses [htmlmin](https://www.npmjs.com/package/htmlmin) in production mode for minification.

##### Configuration

__generator\_config.yml__

```YAML
content:
  posts:
    template: 'post'       # The template for all posts
    scripts:               # scripts for all posts. Requires the scripts asset processor
      - name: 'script.js'
        opts:              # Options for this script
          async: true
    styles:                # styles for all posts. Requires the styles asset processor
      - name: 'styles.css' 
        opts:              # Options for this style
          media: 'all'
    htmlmin:               # HTML minification for production mode. You can specify more htmlmin options if you want
      removeAttributeQuotes: true,
      collapseWhitespace: true,
    urlFormat: '_blog/${year}/${month}/${date}/' # Uses the date in the meta data to create a url in this format. Values within ${...} will be replaced by numbers given in the date key in the post's meta data
    dateFormat: 'DD-MM-YYYY' # used to parse the date key in the posts meta data
```

__File meta data__

* __url__: Defines the URL to be used for the post. If not specified the file/folder name is used. The `urlFormat` value is used a prefix for the URL
* __date__: It is used to define the URL and is a required attribute. Its format is specified by the `dateFormat` key. Posts are also sorted according to this date (newest first)
* __template__: Defines the template to be used for this post. If not specified the `template` in generator\_config.yml is used
* __scripts__: Same format as above. If scripts are defined in the configuration file and the meta data then those are concatenated. If the same name is defined multiple times, the last definition is used
* __styles__: Same format as above. If styles are defined in the configuration file and the meta data then those are concatenated. If the same name is defined multiple times, the last definition is used

##### Template variables

* __current__: Object for the current post
  * __content__: Object containing the page content. If no sections are used `content.content` is all content of the file minus meta data
  * __meta__: Object containing all post meta data
  * __styles__: Array of all styles for this post (only if styles is defined in the configuration or meta)
  * __scripts__: Array of all the scripts for this post (only if scripts is defined in the configuration or meta)
* __posts__: Array containing all posts. Each post is an object with the same attributes as `current`

### Asset Processors

The asset processors are used for files/folders in the assets folder. Asset processors are deactivated by default and need to be explicitly activated using the `active` key in the configuration file.

#### Common configuration

```YAML
asset:
  active: # Activate the styles and scripts asset processors
    - 'styles'
    - 'scripts'
  common:
    path: 'assets' # Path where the assets are saved
```

Built-in asset processors:

* images
* scripts
* styles
* fonts

#### images

Is used to copy images from the assets directory to the output directory. Uses [imagemin](https://github.com/imagemin/imagemin) in production mode to minify/optimize the images. You have to configure which minification plugin is used for each extension. Read the imagemin documentation for information on which plugins are available. The plugin must be installed using npm and it will automatically be loaded by the tool. All imagemin plugins use `imagemin-pluginName` as package name. You need to just use `pluginName` the `imagemin-` prefix is automatically added.

##### Configuration

__generator\_config.yml__

```YAML
asset:
  images:
    minify:                   # imagemin configuration
     '.png':                  # config for all .png images
       plugin: 'optipng'      # plugin to be used imagemin-optipng
       opts:                  # options for imagemin-optipng
         optimizationLevel: 3

```

#### fonts

Is used to copy fonts from the assets directory to the output directory. Currently not configurable.

#### styles

 It uses [PostCSS](https://github.com/postcss/postcss) to process the CSS files. You can define which PostCSS plugins to use. The plugins need to be installed via npm. An exception is `cssnano` which is installed by default and used in production mode to minify the CSS. The plugins will automatically be loaded by the tool. There is also support for the following PostCSS options: `syntax`, `parser` and `stringifier`. For those you can give the name of the PostCSS plugin and it will be automatically loaded by the tool. You would have to install the plugin via npm.

##### Configuration

__generator\_config.yml__

```YAML
asset:
  styles:
    postcss: 
      plugins:                    # PostCSS plugins
        prod:                     # Plugins for production mode
          - name: 'autoprefixer'  # Use the autoprefixer plugin
            opts:                 # Options for autoprefixer
              browsers:
                - 'last 2 versions'
          - 'cssnano'
        dev:
          - name: 'autoprefixer'
      opts:                       # Options for PostCSS. Supported are syntax, parser, stringifier
        parser: 'postcss-scss'    # Use postcss-scss as parser
    bundles:                  # Define bundle with name common.css. The bundle can be used in the styles of pages/posts
      - name: 'common.css'
        files:                # Files to be concatenated to create the bundle
          - '00-normalize.css'
          - '01-grid.css'
```

##### Template variables

* __styles__: Array containing all style objects

#### scripts

It uses [UglifyJS](https://github.com/mishoo/UglifyJS2) to minify the scripts in production mode.

##### Configuration

__generator\_config.yml__

```YAML
asset:
  scripts:
    minify:                   # UglifyJS options
      mangle: true
    bundles:                  # Define bundle with name common.js. The bundle can be used in the scripts of pages/posts
      - name: 'common.js'
        files:                # Files to be concatenated to create the bundle
          - 'index.js'
          - 'menu.js'
```

##### Template variables

* __scripts__: Array containing all script objects

### Decorators

The decorators are used to extend and manipulate your contents. Decorators are deactivated by default and need to be explicitly activated using the `active` key in the configuration file.

#### Common configuration

__generator\_config.yml__

```YAML
decorator:
  active: # Activate the tags decorator
    - 'tags'
```

Built-in decorators:

* tags
* sitemap
* pagination

#### tags

Reads the tags key out of the meta data for the defined content type (`createTagsFor` array) and create a template variable named `tags` which is an object with keys matching the names in `createTagsFor`. Each key is an array containing the relevant content. It also extends the tags of the meta data and adds a URL to them.

##### Configuration

__generator\_config.yml__

```YAML
decorator:
  tags:
    createTagsFor:
      - 'posts'
```

__File meta data__

* __tags__: Tags for an individual page/post etc.

##### Template variables

* __tags__: Object containing all keys defined in `createTagsFor`. Each key has an array as value containing the relevant content

#### sitemap

Creates a sitemap.xml file for your site.

##### Configuration

__generator\_config.yml__

```YAML
decorator:
  sitemap:
   domain: 'http://localhost:8080' # domain to be used in the sitemap
   createMapFor:                   # the content which should be added to the sitemap
     - 'pages'
     - 'posts'
```

__File meta data__

* __sitemap__: Object with the following keys: `priority`, `lastModified` (lastmod) and `changeFrequency` (changefreq). Check [sitemaps.org](https://www.sitemaps.org/protocol.html) for the values allowed for the keys.

#### pagination

With this decorator you can for example paginate posts. For this to work you need to define the content to paginate an a page (`paginationPage` key) in which to write the content. The decorator will automatically create copies of the page and each copy will receive a number of content depending on `contentPerPage`.

##### Configuration
 
__generator\_config.yml__
 
```YAML
decorator:
  pagination:
    paginate:                      # Array with the contents to paginate
      - contentToPaginate: 'posts' # content type to paginate (pages cannot be paginated)
        paginationPage: 'blog'     # template to be used for the pagination contents
        contentPerPage: 5          # the number of content files per page
```

##### Template variables

* __controls__: An array of objects with keys: `label`, `isActive`, `url`. The `label` is the page number, `isActive` informs us on which pagination page we are and the `url` can be used to navigate to a specific page
* __currentPageNumber__: The number of the current page
* __numOfPages__: Total number of pagination pages
* __[contents to paginate]__: This key changes depending on `contentToPaginate`, if `contentToPaginate` is `posts`, then this key will also be `posts`. The key always contains an array with as many content objects as `contentPerPage`. The last page might have less.

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
If you have any questions feel free to open an [issue](https://github.com/nponiros/FlexiSiteGen/issues) with your question.

## License

[MIT License](./LICENSE)
