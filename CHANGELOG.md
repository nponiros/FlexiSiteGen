# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

Please not that there was no stable release yet and things may break at any time

## [] - Not released

### Changed

* Fix https://github.com/nponiros/FlexiSiteGen/issues/4
* Fix https://github.com/nponiros/FlexiSiteGen/issues/5
* Bundles are no longer passed to PostCSS. Only the files making up the bundle are run through PostCSS
* The tags decorator now supports the urlWithExtensions attribute in the config

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
