# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## [] - Not Released

## [0.5.0] - 2017-16-09

### Fixes

* Fix https://github.com/nponiros/FlexiSiteGen/issues/9
* Fix https://github.com/nponiros/FlexiSiteGen/issues/11

### Breaking

* Sitemap now removes "index" if it is at the end of a path. Example http://example.com/index would become http://example.com/
* Pagination no longer adds "Page ${num}" to the title of the pagination page. Use "current.pagination.currentPageNumber" if you want to add the page number to the title. Closes #10

### Added

* Allow global meta to be used by all pages. Issue #8
* Allow global meta to be used by all posts. Issue #8
* `sitemap.exclude` can be used to exclude a page from the sitemap
* Only relevant for plugin authors
  * Add helper `update`. A wrapper for [immutability-helper](https://github.com/kolodny/immutability-helper)
  * Add helper `moment`. A wrapper for [moment](https://momentjs.com)
  * Pass extendify to the init functions of content/asset processors and decorators

## [0.4.2] - 2017-19-02

### Changed

* Fix https://github.com/nponiros/FlexiSiteGen/issues/4
* Fix https://github.com/nponiros/FlexiSiteGen/issues/5
* Bundles are no longer passed to PostCSS. Only the files making up the bundle are run through PostCSS
* The tags decorator now supports the urlWithExtensions attribute in the config
* Move urlWithExtension to global common from content common in the default config

### Breaking

* The HTML body splitter now uses a new regexp. See README for the new format. Closes #7

## [0.3.0] - 2017-14-01

### Added

* basePath property to global config
* support nested directories for images and fonts
* support options for PostCSS plugins and for PostCSS itself (only parser, syntax, stringifier)

### Changed

* Fix link when generating the initial site via the init action
* Make sure that we have styles/scripts in posts/pages before trying to access those
* Pagination plugin adds .html if urlWithExtension is true (https://github.com/nponiros/FlexiSiteGen/issues/3)

### Breaking changes

* If we use the same script/style name twice when using the createScripts/createStyles helper then only the last reference is used. The rest get removed.
* Imagemin was updated. Now there is no default image optimization. The user must configure that in the generator config file
* Rename global to common in configuration file
* Configuration: move the path key into the common object for each processor needing it
* Change the way the post urls are created. Use urlFormat for it now
* The format of the PostCSS plugins definition in the config has been changed
  * Used to be an array of plugin namens
  * Is not an array of objects with `name` and `opts` properties with `name` being the name of the PostCSS plugin to load
  * The README shows how you have to configure PostCSS now

## [0.2.0] - 2016-15-05

* Add init action

## [0.1.0] - 2016-12-05

* Initial release
