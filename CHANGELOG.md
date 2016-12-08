# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

Please not that there was no stable release yet and things may break at any time

## [] - Not released

### Added

* basePath property to global config

### Changed

* Fix link when generating the initial site via the init action
* Make sure that we have styles/scripts in posts/pages before trying to access those

### Breaking changes

* If we use the same script/style name twice when using the createScripts/createStyles helper then only the last reference is used. The rest get removed.
* Imagemin was updated. Now there is no default image optimization. The user must configure that in the generator config file
* Rename global to common in configuration file
* Configuration: move the path key into the common object for each processor needing it
* Change the way the post urls are created. Use urlFormat for it now

## [0.2.0] - 2016-15-05

* Add init action

## [0.1.0] - 2016-12-05

* Initial release
