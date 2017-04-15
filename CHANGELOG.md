# Change history for stripes-core

## [0.8.0](https://github.com/folio-org/stripes-core/tree/v0.8.0) (IN PROGRESS)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.7.0...v0.8.0)

* Disallow access to modules that the user does not have permission to use, as specified by a `module.NAME.enabled` permission bit. Fixes STRIPES-273.
* Added Screen-reader-only 'Skip Navigation' link to Main Navigation.
* Main Navigation adjusted to keep its height at smaller resolutions.
* Set font stack. Switched from a single font to a font-stack based on system fonts.
* Add support for the `hasAllPerms` configuration item. Fixes STRIPES-325.

## [0.7.0](https://github.com/folio-org/stripes-core/tree/v0.7.0) (2017-04-12)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.6.0...v0.7.0)

* In [the release procedure documentation](doc/release-procedure.md), add more on tagging releases, change-logging and working towards the next release.
* Added id "ModuleContainer" to module container `<div>`
* Increased stripes-components dependency to v0.6.0.

## [0.6.0](https://github.com/folio-org/stripes-core/tree/v0.6.0) (2017-04-11)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.5.0...v0.6.0)

* Upgrade stripes-connect dependency to 0.3.0.
* Brief discussion of dependencies in [doc/overview.md].

## [0.5.0](https://github.com/folio-org/stripes-core/tree/v0.5.0) (2017-04-11)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.4.0...v0.5.0)

* Add a "Settings" text-link at top left, next to the FOLIO branding, that transitions to /settings. It is _not_ based on UX designs, it's just a placeholder so we can run the patron-group and material-type CRUDding. See LIBAPP-76, LIBAPP-139.
* Pull in settings from ui-items as well as ui-users.
* Pass the Stripes object down into settings components as well as regular components. Fixes STRIPES-268.
* Add a new section to [The Stripes Module Developer's Guide](doc/dev-guide.md) on the Stripes object. Finishes STRIPES-259.
* Remove support for, and documentation of, the `disableAuth` setting. Fixes STRIPES-298.

## [0.4.0](https://github.com/folio-org/stripes-core/tree/v0.4.0) (2017-03-22)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.3.0...v0.4.0)

* Each module now gets its curried `connect` function in the `stripes` object. For now, that curried `connect` is still also passed as its own prop to the top-level component of the module, but **this is deprecated and will be removed in the next release**.

## [0.3.0](https://github.com/folio-org/stripes-core/tree/v0.3.0) (2017-03-21)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.2.0...v0.3.0)

* Switch to using the new release of [React Router](https://reacttraining.com/react-router/). This significantly changes the API for URL-derived props and for changing the URL. In addition to their detailed documentation you may also find [this commit](https://github.com/folio-org/ui-items/commit/adf24349efef3bf2dc5928c8a76a5991369577b9) illustrative.
* Switch to new way of providing logger and permissions to modules, as part of a single `stripes` object that is passed as a prop to the top-level component of each module. Note that **this is a breaking change** so this release should really get a new major version number.

## [0.2.0](https://github.com/folio-org/stripes-core/tree/v0.2.0) (2017-03-12)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.1.0...v0.2.0)

* One trivial change: the logger object is passed into [stripes-connect](https://github.com/folio-org/stripes-connect/). Requires stripes-connect v0.1 or better.

## [0.1.0](https://github.com/folio-org/stripes-core/tree/v0.1.0) (2017-03-10)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.0.12...v0.1.0)

* The "FOLIO" button at top left now returns to the home page of the SPA. Fixes STRIPES-250.
* When logging in as a user, the permissions of that user are now loaded, and are made available to the top-level component of loaded modules as a new `currentPerms` property. Its value is an object whose keys are machine-readable permission names and whose values are the corresponding human-readable names (for use in error messages). Fixes STRIPES-248.
* For time being, permissions are also listed in the pop-down user menu at top right; this will be removed at some point, but is handy in the short term.

## [0.0.12](https://github.com/folio-org/stripes-core/tree/v0.0.11) (2017-03-10)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.0.11...v0.0.12)

* New dependency on `@foliostripes-logger`. This is used lightly within stripes-core itself, and more importantly a configured logger object is passed as the `logger` property to the top-level component of all loaded modules. Part of STRIPES-226.
* Change to internal API of moduleRoutes: instead of exporting the list of routes, now exports a function that returns them. That function takes a logger object as a parameter, and passes it as a prop to the modules.
* Use a specific copy of react when stripes-core is linked. Fixes STRIPES-220.

## [0.0.11](https://github.com/folio-org/stripes-core/tree/v0.0.11) (2017-03-01)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.0.10...v0.0.11)

* Revert c8a3ba88aca80e34970be6d8ac13c13ad7fd41c8, undoing the STRIPES-220 fix, in order to fix the much more serious STRIPES-230.

## [0.0.10](https://github.com/folio-org/stripes-core/tree/v0.0.10) (2017-02-24)

* Requires v0.0.9 of `stripes-connect`.
* First version to have a documented change-log. Each subsequent version will describe its differences from the previous one.

