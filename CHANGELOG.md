# Change history for stripes-core

## FORTHCOMING
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.0.12...master)

* The "FOLIO" button at top left now returns to the home page of the SPA. Fixes STRIPES-250.
* When logging in as a use, the permissions of that user are now loaded, and are made available to the top-level component of loaded modules as a new `currentPerms` property. Its value is an object whose keys are machine-readable permission names and whose values are the corresponding human-readable names (for use in error messages). Fixes STRIPES-248.
	
## [0.0.12](https://github.com/folio-org/stripes-core/tree/v0.0.11) (Fri 10 Mar 11:46:53 GMT 2017)
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

