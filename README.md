# FlexiSiteGen

A flexible, configurable static website generator using pug (used to be jade) templates.

This software ist still very much experimental and might break at any time. Use with caution.

## CLI

### generate

```
flexi-site-gen generate
```

Generates the website outputing all needed files into the directory specified with the `publicDir` property.

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
* archive
* sitemap

### tags

### archive

### sitemap

## Plugins

Content processors, asset processors and decorators are all considered plugins.
Besides the internal plugins which are part of the generator, you can create your own plugins.
In order to use one of your plugins, you have to give its path to the `plugins` property in the generator's config file.
If you define a plugin having the same name as an internal plugin then yours will take precedence.
