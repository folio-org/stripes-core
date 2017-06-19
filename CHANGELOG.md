# Change history for stripes-core

## [1.14.0](https://github.com/folio-org/stripes-core/tree/v1.14.0) (2017-06-19)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.13.0...v1.14.0)

* New script `util/package2md.js` converts UI-module package.json into module descriptor. Fixes STRPCORE-5.
* About page shows stripes-core's own back-end dependencies. Fixes STRPCORE-6.
* Declared action-names are gathered from all registered modules and provided as the `actionNames` property of the Stripes objecty. Part of STRPCORE-2.
* Key bindings are loaded as the `bindings` property of the Stripes object. Part of STRPCORE-2.
* "Soft logout" retains discovery information across logins. Fixes STRPCORE-4.
* Provide `setLocale` and `setBindings` functions on the Stripes object. Fixes STRPCORE-3.
* Begin registering stripes-core's own dependencies on Okapi interfaces.

## [1.13.0](https://github.com/folio-org/stripes-core/tree/v1.13.0) (2017-06-12)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.12.0...v1.13.0)

* Discover Okapi's own version number; document its availability in the Stripes object; display it in the About page. Fixes STRIPES-416.
* Use compound `/bl-users/login` request. As a result we no longer need to make separate requests in `getUser` or `getPerms`. Fixes TRIPES-417.

## [1.12.0](https://github.com/folio-org/stripes-core/tree/v1.12.0) (2017-06-12)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.11.0...v1.12.0)

* Show ui-module-to-backend-interface dependencies in About page. Fixes STRIPES-414.
* Warn in the About page if required back-end interfaces are absent. Fixes STRIPES-400.

## [1.11.0](https://github.com/folio-org/stripes-core/tree/v1.11.0) (2017-06-11)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.10.0...v1.11.0)

* About page shows back-end modules and interfaces. Fixes STRIPES-410.

## [1.10.0](https://github.com/folio-org/stripes-core/tree/v1.10.0) (2017-06-10)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.9.0...v1.10.0)

* Implemented service discovery. The Stripes object now contains a `discovery` element whose `modules` and `interfaces` elements contain data obtained by probing Okapi. Fixes STRIPES-399.
* The Stripes object provides a new `hasInterface` method: see the _Developer's Guide_ for details. Fixes STRIPES-401.
* Added [documentation](doc/dev-guide.md#checking-interfaces).

## [1.9.0](https://github.com/folio-org/stripes-core/tree/v1.9.0) (2017-06-06)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.8.0...v1.9.0)

* Support the `autoLogin` configuration item. See [the Developer's Guide](doc/dev-guide.md#the-stripes-object). Fixes STRIPES-391.
* In settings pane, list apps with settings in alphabetical order. Fixes the stripes-core part of STRIPES-358.
* Navigating to any app now continues from the last URL visited within that app, providing app-level persistence and bringing us closer to something that we might call task-switching. Fixes STRIPES-403.
* Similarly, navigating to an area within /settings, then returning to Settings, comes back to the same settings page used previously. Fixes STRIPES-402.
* The last two items mean that we now have what we described as "multitasking". Fixes STRIPES-208.
* Upgrade stripes-components dependency to v0.10.1.

## [1.8.0](https://github.com/folio-org/stripes-core/tree/v1.8.0) (2017-05-24)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.7.0...v1.8.0)

* Reinstate the `disableAuth` configuration setting. Fixes STRIPES-390.

## [1.7.0](https://github.com/folio-org/stripes-core/tree/v1.7.0) (2017-05-23)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.6.0...v1.7.0)

* Provides the Stripes object as `stripes` on the React context (as well as continuing to provide it as the `stripes` property) for all application and settings modules. Fixes STRIPES-388.
* Adds new speculative design document [_Implementing configurable hot-keys in Stripes_](doc/hotkeys.md)

## [1.6.0](https://github.com/folio-org/stripes-core/tree/v1.6.0) (2017-05-22)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.5.0...v1.6.0)

* Loads the set of plugin preferences from mod-configuration and stores it in the Stripes object as `stripes.plugins`, a map from plugin-type to preferred implementation. If something goes wrong -- most likely, because mod-configuration is not running -- it defaults to an empty map.
* Render logged-in user-name correctly after field-name change in back-end users module. Fixes STRIPES-381.
* Upgrade dependencies to stripes-components v0.9.0 and stripes-connect v2.1.0.

## [1.5.0](https://github.com/folio-org/stripes-core/tree/v1.5.0) (2017-05-19)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.4.0...v1.5.0)

* About page lists modules of all types, not just applications and settings.
* Bump stripes-components dependency to v0.8.0, to provide `<Pluggable>`.
* Add [documentation](doc/plugins.md) of the model for plugins.

## [1.4.0](https://github.com/folio-org/stripes-core/tree/v1.4.0) (2017-05-12)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.3.0...v1.4.0)

* Perform "soft logout" that does not require a reload. Fixes STRIPES-333.
* Depend on v2.0.0 of stripes-connect.

## [1.3.0](https://github.com/folio-org/stripes-core/tree/v1.3.0) (2017-05-09)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.2.0...v1.3.0)

* Add large new section _Thinking in Stripes_ to [the _Module Developer's Guide_](doc/dev-guide.md). This is pulled in from what used to be a separate document in the stripes-connect repository. See STRIPES-103.
* Depend on v1.0.0 of stripes-connect.

## [1.2.0](https://github.com/folio-org/stripes-core/tree/v1.2.0) (2017-05-08)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.1.0...v1.2.0)

* New About page (on `/about`) displays the version of each of the Stripes platform libraries and UI modules. This is linked from the front page.

## [1.1.0](https://github.com/folio-org/stripes-core/tree/v1.1.0) (2017-05-05)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.0.0...v1.1.0)

* Loads the prevailing locale from mod-configuration and stores it in the Stripes object as `stripes.locale`. If something goes wrong -- most likely, because mod-configuration is not running -- it defaults to `en-US`.

## [1.0.0](https://github.com/folio-org/stripes-core/tree/v1.0.0) (2017-04-26)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v0.7.0...v1.0.0)

* Disallow access to modules that the user does not have permission to use, as specified by a `module.NAME.enabled` permission bit. Fixes STRIPES-273.
* Added Screen-reader-only 'Skip Navigation' link to Main Navigation.
* Main Navigation adjusted to keep its height at smaller resolutions.
* Set font stack. Switched from a single font to a font-stack based on system fonts.
* Add support for the `hasAllPerms` configuration item. Fixes STRIPES-325. **Note that the name of this item is subject to change**.
* Add new utility script, `perm-tree.js`.
* New module type `settings`. These modules provide a component to be included in the settings are rather than a full application. Settings links are automatically included for each such module.
* Modules of type `app` that have the `stripes.hasSettings` configuration item set true in their `package.json` are also included in the settings menu. For these modules, the special property `showSettings` is passed into the top-level component when they are invoked in this context. **Note that this is a backwards-incompatible change**, hence the new major version number.
* Note that there is nothing special about this release being a "1.0". The number does not denote a level of code maturity or feature-completeness, only that the delta since the last release include a backwards-incompatible change.

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

