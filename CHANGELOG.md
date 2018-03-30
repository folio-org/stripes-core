# Change history for stripes-core

## 2.10.0 (IN PROGRESS)

* Update [Creating a new development setup for Stripes](doc/new-development-setup.md) for `stripes-cli`-based workflow. Fixes STCOR-140.
* New document, [Depending on unreleased features](doc/depending-on-unreleased-features.md). Fixes STCOR-152.
* Reorganize [Creating a new development setup for Stripes](doc/new-development-setup.md) and add `configure` script. Refs STCOR-140.
* Update docs to reflect that "stripescli" is now "stripes". Refs STCLI-11.
* Remove ui-okapi-console from pull-stripes; it's deprecated. Fixes STCOR-156.
* Add notes about stripes-cli install trouble. Fixes STCOR-154.
* Lint. It's what's for dinner. Fixes STCOR-157.
* Deprecate ui-items. Refs UIIN-18.
* Add Vagrant doc to [Creating a new development setup for Stripes](doc/new-development-setup.md). Fixes STCOR-160.
* The anointed resource is correctly set from the URL. Fixes STCOR-134. Available from v2.9.1.
* Rename bin command from `stripes` to `stripescore` to avoid conflicts with the CLI. STCOR-153
* When the FOLIO server is absent, say so instead of displaying nothing at all. Fixes STCOR-164.
* Guard against absence of icons and other metadata. Mitigates STCOR-165.
* Add -l to stripes-pull to iterate through local directories instead of through a hard-coded list. Fixes STCOR-166. Available from v2.9.2.
* Update react-cookie dependency, eliminating a duplicate-package warning from WebPack. Fixes part of STCOR-167.
* Do not emit "no icons defined in stripes.icons" warning for non-app modules. Fixes STCOR-171.
* Ignore yarn-error.log file. Refs STRIPES-517. 
* Don't add "ui-" prefix to translation keys in stripes libraries. Fixes STCOR-178. Available from v2.9.3. 
* Don't throw errors when searching for translations in stripes- libraries; those are optional, not dependencies. Fixes STCOR-183. Available from v2.9.4.

## [2.9.0](https://github.com/folio-org/stripes-core/tree/v2.9.0) (2018-02-01)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.8.0...v2.9.0)

* Add documentation on [how to add a permission to a user from the command-line](doc/adding-permissions.md#add-a-permission-to-a-user). Fixes STCOR-112.
* Restore open-in-new-tab to primary navigation. Fixes STCOR-113.
* Fix Webpack lint errors. Fixes STCOR-115.
* `util/cruft.pl` checks for unused packages. Fixes STRIPES-490.
* Write [documentation for URL navigation by anointed resource](doc/dev-guide.md#url-navigation). Fixes STCOR-118.
* When login fails in a way other than user/password mismatch, report that error to the user. Fixes STCOR-119.
* Change app indicator. Fixes STCOR-121.
* Move about under settings. Fixes STCOR-123.
* Support loading SVG images via WebPack. Fixes STCOR-124.
* Add support for basic tenant branding of logo and favicon via stripes config. FOLIO-988.
* In discovery, retrieve modules installed per-tenant instead of globally. STCOR-114.
* Push new URLs onto history instead of replacing old one. Fixes STCOR-128.
* Add "Home" link to user menu, but only when "showHomeLink" developer option is on. Fixes STCOR-130 and STCOR-131.
* Add new document, [Stripes application metadata bundles](doc/app-metadata.md). Fixes STCOR-117 and STCOR-129.
* Extend babel-loader test condition to exclude specific folio-scoped modules. Fixes STRIPES-499
* Add `-c` (clone git repositories) mode to `pull-stripes`. Fixes STCOR-135.
* `link-stripes -i` skips platform packages, quietly re-links already-linked packages, and exits when done. Fixes STCOR-136.
* Add new document, [Creating a new development setup for Stripes](doc/new-development-setup.md). Fixes STCOR-137.
* Gather module translations from separate files and add ability to filter languages at build-time. Fixes STCOR-49.
* Make About component responsive to narrow screens. No JIRA issue, but see PR #155.
* Better construction of notification links. Fixes STCOR-104.
* Add Apollo provider so modules can use GraphQL. Fixes STCOR-133.
* New `util/configure` script handles new development setup in one go; corresponding updates to [Creating a new development setup for Stripes](doc/new-development-setup.md). Refs STCOR-140.

## [2.8.0](https://github.com/folio-org/stripes-core/tree/v2.8.0) (2017-11-20)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.7.0...v2.8.0)

* Improved navigation facilities for modules:
  * Changes to URL parameters can now be made by assigning to an anointed stripes-connect resource. Fixes STRIPES-452, though documentation is still needed.
  * Assignment to special parameter `_path` within the anointed stripes-connect resource will change the URL path. Fixes STCOR-105.
  * Setting a query parameter in the anointed stripes-connect resource to null removes it from the URL. Fixes STCOR-106.
* Improvements to WebPack interactions:
  * Move stripes-loader logic into stripes-core as a webpack plugin. Fixes STCOR-25.
  * Correct new dependencies for the WebPack plugin. Fixes STCOR-83.
  * WebPack build failures now cause a non-zero exit status. Fixes STCOR-85.
  * Development server once more falls back to `index.html` when addressed at a directory. Fixes STCOR-86.
  * Source map option for static builds: `stripes build stripes.config.js --sourcemap`. Fixes STCOR-64.
* Infrastructure improvements:
  * Move epics to core. Fixes STCOR-82.
  * Add dependency on okapiInterface "authtoken" 1.0. Fixes STCOR-76.
  * Extend hasPermission to accept a list of permissions, update documentation. Fixes STCOR-98.
  * Add tag with version info for integration test reports. Fixes STCOR-74.
* Notifications:
  * Show a user's Notifications. Fixes STSMACOM-11; refs STCOM-48.
  * Notification center implements permission checking. Fixes STCOR-102.
  * Notifications are dismissible. Fixes STCOR-103.
* "Trivial" module:
  * Update the "Trivial" module to uses `props.resources`, not `props.data`. Fixes STCOR-92.
  * Determine why "Trivial" module is not getting updated on folio-testing. Fixes STCOR-93.
  * Removing `examples/trivial`; it's now a separate module. Fixes STCOR-94 (and the old duplicate STCOR-33).
* Documentation:
  * Add developer's-guide [section on i18n functionality](doc/dev-guide.md#internationalization). Fixes STCOR-56
  * The [release-procedure documentation](doc/release-procedure.md) now says to run `npm publish` after the release-branch merge, fitting in with the PR-based code contribution workflow. Fixes STCOR-89.
  * Add new document, [Adding new permissions to FOLIO UI modules](doc/adding-permissions.md). Fixes STCOR-107.
* Miscellaneous:
  * Label a tenant's disabled modules on `/about`. Fixes STCOR-69.
  * ESLint no longer runs on nested `node_modules` directory. Fixes STCOR-91.
  * Bump stripes-components dependency from ancient v1.6.0 to v1.9.0

## [2.7.0](https://github.com/folio-org/stripes-core/tree/v2.7.0) (2017-09-01)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.6.1...v2.7.0)

* `stripes.configureModule` simple implmentation adds module configuration to the stripes object (STRIPES-464).

* `stripes.setLocale` function re-loads translations. Fixes STCOR-53.
* Optimize `<Root>` render. Fixes STCORE-58.
* Avoid use of epics in detecting Okapi readiness. Fixes STCOR-63.
* Change default logging categories to `core,action,xhr`. Fixes STCOR-71.
* Settings menu only displays a module's entry if the relevant permission exists. Fixes STCOR-72.
* Upgrade dependencies: stripes-components 1.7.0 and stripes-connect 2.7.0.

## [2.6.1](https://github.com/folio-org/stripes-core/tree/v2.6.1) (2017-08-17)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.6.0...v2.6.1)

* Reinstate hasPerm/hasInterface in settings pages. Fixes STCOR-57.

## [2.6.0](https://github.com/folio-org/stripes-core/tree/v2.6.0) (2017-08-17)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.5.1...v2.6.0)

* `ui-` prefix for module-specific translation strings is hardwired. Fixes STCOR-55.
* Support for the `redux` logging category reinstated.
* Furnish the `intl` object as part of the Stripes object. Fixes STCOR-52.
* Provide `stripesShape` for use in propTypes/contextTypes. Fixes STCOR-32.

## [2.5.1](https://github.com/folio-org/stripes-core/tree/v2.5.1) (2017-08-15)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.5.0...v2.5.1)

* Update stripes-redux to v2.0.0

## [2.5.0](https://github.com/folio-org/stripes-core/tree/v2.5.0) (2017-08-15)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.4.0...v2.5.0)

* Work towards supporting single sign-on. Fixes STCOR-44.
* Setup react-intl for internationalisation. Fixes STCOR-51.
* Update stripes-redux dependency. SRDX-1 and SRDX-2.
* Combine all translations from currently active stripes modules. Fixes STCOR-48.

## [2.4.0](https://github.com/folio-org/stripes-core/tree/v2.4.0) (2017-08-04)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.3.1...v2.4.0)

* About page shows Okapi tenant and URL. Fixes STCOR-39.
* Invert minor-version comparison in `isVersionCompatible`. Fixes STCOR-41.
* Alert on stripes-connect errors. STCON-25.
* `/sso-landing` query-parameter name changed from `sso-token` to `ssoToken`. Changes outcome of STCOR-20.
* `/sso-landing` accepts `ssoToken` cookie as well as query parameter. Fixes STCOR-38.
* Add indicator of selected app. Fixes STCOR-40.
* Update stripes-components to 1.4.0.
* Switch from redux-logger to the redux-devtools-extension. You'll need to install that in your browser but then will have convenient access to the redux state and actions without the endless console messages.
* Fix navigation highlighting in settings. Fixes STRIPES-438.

## [2.3.1](https://github.com/folio-org/stripes-core/tree/v2.3.1) (2017-07-18)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.3.0...v2.3.1)

* Guard against stripes-components not having a "stripes" section in package file.

## [2.3.0](https://github.com/folio-org/stripes-core/tree/v2.3.0) (2017-07-18)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.2.0...v2.3.0)

* Implement the `settings.enabled` permission. Fixes STCOR-31.
* Add middleware for side effects. Fixes STCON-16.
* New dependency: stripes-redux.
* Add landing page for Single Sign-On, `/sso-landing`. Fixes STCOR-20.
* Action-names are now gathered from modules' package files rather than from a static member of the exported class. We also gather names from stripes-connect. Fixes STCOR-36.
* Check validity of stored tokens. Fixes STCOR-35.

## [2.2.0](https://github.com/folio-org/stripes-core/tree/v2.2.0) (2017-07-13)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.1.0...v2.2.0)

* The JWT for authentication is now persisted to IndexDB, allowing you to stay logged in across tabs until the token expires. Fixes STCOR-22
* The About page's foundation dependencies are now taken from `stripes.okapiInterfaces` in stripes-core's `package.json`, rather than from `okapiInterfaces` at the top level. Makes this consistent with how dependencies are expressed in modules.
* Add `settings.enabled` permission. Fixes STCOR-30.

## [2.1.0](https://github.com/folio-org/stripes-core/tree/v2.1.0) (2017-07-11)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.0.0...v2.1.0)

* New `setSinglePlugin` function, analogous to `setLocale` and `setBindings`. Fixes STRPCORE-16.
* Add `setToken` function to the Stripes object, to support SSO. Fixes STRPCORE-17.
* The Trivial module can show multiple separate instances of the `<About>` component. Fixes STRPCORE-18.
* Update Stripes release-procedure document to describe Jira procedure. Fixes STRPCORE-19.
* In `examples/trivial/About.js`, eliminate use of `componentWillMount` to provide initial values to resources. Part of STRIPES-433.
* Bump `configuration` and `users-bl` interface dependencies to v2.0.
* Dependency on stripes-components raised to 1.3.0.

## [2.0.0](https://github.com/folio-org/stripes-core/tree/v2.0.0) (2017-07-03)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.14.0...v2.0.0)

* Add hot-keys documentation to the Module Developer's Guide. Fixes STRPCORE-7.
* Icon permissions work for UI modules in any namespace. Fixes STRPCORE-9.
* Add okapiInterfaces (empty) and permissionSets to `examples/trivial/package.json`. Fixes STRPCORE-10.
* `util/package2md` modified to generate IDs that are palatable to Okapi. Fixes STRPCORE-12.
* Changes to CSS toolchain, making nested classes work again. Fixes STRPCORE-13.
* New script, `util/link-stripes`, to yarn-link the various parts of a Stripes development environment. Fixes STRPCORE-14.

## [1.14.0](https://github.com/folio-org/stripes-core/tree/v1.14.0) (2017-06-19)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v1.13.0...v1.14.0)

* New script `util/package2md.js` converts UI-module package.json into module descriptor. Fixes STRPCORE-5.
* About page shows stripes-core's own back-end dependencies. Fixes STRPCORE-6.
* Declared action-names are gathered from all registered modules and provided as the `actionNames` property of the Stripes object. Part of STRPCORE-2.
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
