# Change history for stripes-core

# 9.0.0 (IN PROGRESS)

* Allow suppression of `react-intl` warnings, in addition to errors. Refs STCOR-659.
* Catastrophic Messaging | Return to MARC authority. Fixes STCOR-661.
* Reset App Context Dropdown state when switching apps/unmounting. Fixes STCOR-664.
* PasswordValidationField swallows error messages from API queries. Fixes STCOR-657.

## [8.3.0](https://github.com/folio-org/stripes-core/tree/v8.2.0) (2022-06-14)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v8.2.0...v8.3.0)

* Use documentation's root URL in NavBar `?` link. Refs STCOR-621.
* Allow customization of login page's CSS. Refs STCOR-643.
* Allow customization of navbar CSS. Refs STCOR-644.
* Add `cs_CZ` (Czech, Czechia) to the supported locales. Refs STCOR-645.
* Optionally display Okapi env, mod-configuration, or stripes.config values on about page. Refs STCOR-603.
* Move SSO logon above Folio Username and Password Boxes. Refs STCOR-648.

## [8.2.0](https://github.com/folio-org/stripes-core/tree/v8.2.0) (2022-06-14)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v8.1.0...v8.2.0)

* Align prop-types related to password reset errors. Refs STCOR-590.
* Provide missing `password.compromised` translation. Refs STCOR-595.
* Create/Reset password page > Display password requirements on page. Refs STCOR-576.
* Remove `react-hot-loader` cruft. Refs STCOR-597, STRIPES-725.
* Add id to `<Settings>` navigation pane. Refs STCOR-604.
* Display different message when user attempts to access the set password link when still logged in. Refs STCOR-599.
* Import stripes-components via its public exports. Refs STCOR-612.
* Support testing with Jest/RTL. Refs STCOR-618.
* Export `queryLimit` to provide a default API query limit. Refs STCOR-615.
* Update NodeJS to v16 in GitHub Actions. Refs STCOR-623.
* Provide `useCallout` hook. Refs STCOR-631.
* Add message to indicate user cannot access app/record. Refs STCOR-619.
* Clear console on logout. Refs STCOR-636.
* Forgot username/password pages - Not responsive. Refs STCOR-630.
* Add main landmark to login screen. Refs STCOR-633.
* Record detail panes are empty when printed. Refs STCOR-638.

## [8.1.0](https://github.com/folio-org/stripes-core/tree/v8.1.0) (2022-02-11)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v8.0.0...v8.1.0)

* Use correct `css-loader` syntax. STCOR-577.
* Your password changed confirmation page > Continue to Login URL goes to an error page. Fixes STCOR-582.
* Dependency cleanup. Refs STCOR-584.
* Correct the invalid `PropTypes.stripes` prop-type. And use the alphabet.
* Settings Focus change. Refs STRIPES-731.

## [8.0.0](https://github.com/folio-org/stripes-core/tree/v8.0.0) (2021-09-27)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v7.2.0...v8.0.0)

* Localize ProfileDropdown text. Fixes STCOR-554.
* Increase contrast for ProfileDropdown permissions display. Fixes STCOR-553.
* Provide a list of available numbering formats. Fixes STCOR-555.
* Add 404 error screen for invalid url. Fixes STCOR-533.
* Wait for SSO enabled status response before setting okapi ready. Fixes STCOR-557.
* `AppContextDropdown` uses a constant value to retrieve its icon. Fixes STCOR-547.
* React 17. Refs STCOR-501.
* Upgrade RxJS to v6. Refs STCOR-536.

## [7.2.0](https://github.com/folio-org/stripes-core/tree/v7.2.0) (2021-06-09)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v7.1.0...v7.2.0)

* Provide `useCustomFields` hook. Refs STCOR-550.
* Compile translations to improve performance and reduce console noise.
* Move `<CalloutContext>` back to `<RootWithIntl>` to make sure `<Callout>` works between relogins. Fixes STCOR-534.
* Avoid ReDoS in `validatePhoneNumber`. Refs STCOR-535.
* Access to Help Site from Universal Header. Refs STCOR-531.
* Do not pass useless props to `<Dropdown>`. Refs STCOR-539.
* Introduce `<ModuleHierarchyProvider>`. Refs STCOR-529.
* Introduce `useNamespace` hook which returns module namespace. Refs STCOR-537.
* Indicate that logging out of FOLIO will not affect an SSO session. Refs STCOR-532.
* Introduce `withNamespace` HOC. Refs STCOR-542.
* Improve SAML security. Refs STCOR-544, STCOR-545.
* Pull user's locale settings from configurations on login, if available. Refs STCOR-527.
* Able to close `<AppContextDropdown>` outside. Refs STCOR-543.
* Update `@folio/stripes-cli` to `^2.3.0` and update `karma.conf.js` for `karma` `v6` compatibility. Refs STCOR-551.

## [7.1.1](https://github.com/folio-org/stripes-core/tree/v7.1.1) (2021-04-22)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v7.1.0...v7.1.1)

* Move `<CalloutContext>` back to `<RootWithIntl>` to make sure `<Callout>` works between relogins. Fixes STCOR-534.

## [7.1.0](https://github.com/folio-org/stripes-core/tree/v7.1.0) (2021-04-08)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v7.0.0...v7.1.0)

* provide an HTML entity id for the settings Paneset. Refs STCOR-526.
* Removed fetch of protected okapi /version endpoint. Refs STCOR-525.
* Updated app context menu button style. Refs STCOR-524.
* Increment `stripes-components` to `v9.1.0`.

## [7.0.0](https://github.com/folio-org/stripes-core/tree/v7.0.0) (2021-02-25)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v6.0.0...v7.0.0)

* Validate token using a request that does not require permissions. Refs STCOR-452.
* Update `serialize-javascript` to avoid CVE-2020-7660. Refs STCOR-467.
* Pass a string, not a `<FormattedMessage>`, to `<NavButton>`. Refs STCOR-472.
* Move `CalloutContext` to `<Root>` to avoid issues with Intl. Refs STCOR-481.
* Test HTTP response cleanup. Refs STCOR-483.
* Avoid using `<FormattedMessage>` with render-props. Refs STCOR-472, STCOR-482.
* Add support for building and consuming Webpack DLLs. Refs STCOR-471.
* Provide default HTML formatters to `<IntlProvider>` so we can avoid `<SafeHTMLMessage>`. Fixes STCOR-477.
* Settings > Software version > Display a loading indicator when querying for missing/incompatible modules, STCOR-479.
* Passing in full module name to resolve icon for modules that don't use @folio/ scope prefix. Refs STCOR-490.
* Append dlls to final output during build. STCOR-492.
* Avoid retrying of http requests using `useOkapiKy` hook by default. STCOR-500.
* Expose module context via `useModules`/`withModules`/`withModule`. STCOR-502
* Add `prefix` prop to TitleManager. STCOR-507
* Setup `react-query`. Refs STCOR-508
* Increment `favicons-webpack-plugin` to `v4`. Refs STCOR-510.
* Remove support for `hardsource-webpack-plugin`. Refs STCOR-421, STCOR-510.
* Refactor `<SSOLanding>` to avoid context error; upgrade `react-cookie` for the hooks. Refs STCOR-514.
* Publish `ERROR` events from `<RouteErrorBoundary>` so handler modules can react to them. Refs STCOR-455.
* Dispatch `setOkapiReady` when all resources are loaded. Fixes STCOR-506.
* Configure `swr`. Refs STCOR-516.
* Callouts are opened after page reload. Refs STCOR-518.
* Use `==` where possible for more efficient queries. Refs STCOR-520.
* Do not nest authentication forms. Refs STCOR-522.
* When rehydrating a session from local storage, always dispatch `checkSSO`. Fixes STCOR-514.
* Increment `lodash` for security reasons. Refs STCOR-519.
* Updated app context dropdown button styles to match the home butotn. Refs STCOR-524.

## [6.0.0](https://github.com/folio-org/stripes-core/tree/v6.0.0) (2020-10-06)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v5.0.2...v6.0.0)

* Abandon legacy context! Refs STCOR-390.
* Increment `react-router` to `^5.2`.
* Update location only if `resourceQuery` actually changes. Fixes STCOR-440.
* Do not provide `Intl.DisplayNames` polyfill; Chrome already handles it, and it's huuuuuge. Refs STCOR-442.
* Export the list of supported locales so there is one true source for this. Refs STCOR-443.
* Get OKAPI version and tenant module info after login. Refs STRIPES-671.
* Mock okapi session in local storage for testing. Refs STCOR-444.
* Handle `react-router-dom` deprecation warnings. Refs STCOR-448.
* Update `react-intl` to `v5`. Refs STCOR-449.
* Add `suppressIntlErrors` option to stripes.config.js.
* Refactor `CreateResetPassword` to use final-form instead of redux-form. Refs STCOR-441.
* Add `okapiKy` helpers (see [docs/okapiKy.md](docs/okapiKy.md)).
* Apps menu - The options in the "Apps" menu do not voice as actionable (able to be activated). Refs STCOR-453.
* Adjust package scope name filter to align with NPM rules instead of assuming `@folio/`. Refs STCOR-456.
* Move `moment` to `peerDependencies`. Refs STCOR-464.
* Refactor `CreateResetPassword` to use vanilla `react-final-form` instead of `stripes-final-form` wrapper. Refs STCOR-466.
* Settings > Software version: Remove references to color. Refs STCOR-451.

## [5.0.2](https://github.com/folio-org/stripes-core/tree/v5.0.2) (2020-06-12)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v5.0.1...v5.0.2)

* Better a11y for login errors. Refs STCOR-430.
* Support `users-bl` `v6.0` (some unused endpoints were removed). Refs STCOR-436, STRIPES-685.

## [5.0.1](https://github.com/folio-org/stripes-core/tree/v5.0.1) (2020-06-08)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v5.0.0...v5.0.1)

* Show app icons in the settings navigation. It's pretty.
* Make accessible errors at `Login` page. Refs STCOR-430.
* Stop filtering "missing permission" warnings from `react-intl`. Refs STCOR-424.
* Provide polyfills related to `react-intl` for consumption by Electron in Nightmare tests. Refs STCOR-435, STRIPES-672.

## [5.0.0](https://github.com/folio-org/stripes-core/tree/v5.0.0) (2020-05-19)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v4.1.0...v5.0.0)

* `PropTypes` corrections for `history.location` et al.
* Style tweaks for `<NavList>`, apps menu.
* Suppress `react-intl` warnings about missing permissions translations. Refs STCOR-424.
* Support loan-storage v7. Refs STCOR-425.
* Provide `react-intl` as a dev-dep. Refs STRIPES-672.
* Moved `<OverlayContainer>` into the main content area to fix an aXe warning. Refs STCOR-419.
* Pin `moment` at `~2.24.0`. Refs STRIPES-678.

## [4.1.0](https://github.com/folio-org/stripes-core/tree/v4.1.0) (2020-03-16)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v4.0.0...v4.1.0)

* Security update `eslint` to `6.2.1`. Refs STCOR-412.
* Support `stripes.optionalOkapiInterfaces`. Refs OKAPI-509.
* Correctly configure react-hot-loader.

## [4.0.0](https://github.com/folio-org/stripes-core/tree/v4.0.0) (2020-03-04)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.12.0...v4.0.0)

* Gather translations and icons from `stripesDeps` listed in the `stripes` section of package.json. (STCOR-414)
* Add missing Event class for emulating browser events in tests. Refs UIDEXP-20.
* Added `CalloutContext` context for rendering cross-route/component callouts.
* Added workflow for auth token expiration to force users to log back in, returning to their previous activity. Refs STCOR-37.

## [3.12.0](https://github.com/folio-org/stripes-core/tree/v3.12.0) (2020-03-03)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.11.2...v3.12.0)

* Upgrade babel to v7.x. Refs STCOR-381.
* Update Mirage library. Part of STCOR-407.
* Adjust Route propTypes to accept lazy loaded components. Refs STCOR-408.
* Link `Change password` in `ProfileDropdown` shows up depending user's permissions. Refs STCOR-409.
* Increase test coverage to 80% in `<SSOLogin>` component. Refs STCOR-376.

## [3.11.2](https://github.com/folio-org/stripes-core/tree/v3.11.2) (2020-02-20)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.11.1...v3.11.2)

* Add missing Event class for emulating browser events in tests. Refs UIDEXP-20.

## [3.11.1](https://github.com/folio-org/stripes-core/tree/v3.11.1) (2019-12-10)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.11.0...v3.11.1)

* Correctly dismiss the `Home` dropdown menu after clicking it.
* Correct label and autocomplete values on login-related forms. Refs STCOM-632
* Bump `serialize-javascript` to `v2.1.2` to avoid an XSS vulnerability (https://github.com/yahoo/serialize-javascript/security/advisories/GHSA-h9rv-jmmf-4pgx).
* Restore the current service point label to the profile dropdown button. Fixes STCOR-404.
* Improve accessibility, add attribute `aria-label` to `nav` tag in Settings. Refs UICAL-85.

## [3.11.0](https://github.com/folio-org/stripes-core/tree/v3.11.0) (2019-12-04)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.10.2...v3.10.3)

* Clear registered epics during BigTest app `teardown`. Part of STRIPES-659.
* Refactor login form to final-form. Part of STCOR-395.
* Show current service point in navbar. Refs STCOR-396.
* Adjust `<MainNav>` visible nav items based on window-width. Refs STCOR-377.
* Add WebPack support for handlebars-loader.
* Monkey-patch `FakeXMLHttpRequest` to avoid breaking changes in its `v2.1.1` release. Refs FOLIO-2369.
* Use updated `<Dropdown>` component in app navigation menus.

## [3.10.5](https://github.com/folio-org/stripes-core/tree/v3.10.5) (2019-12-04)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.10.4...v3.10.5)

* Monkey-patch `FakeXMLHttpRequest` to avoid breaking changes in its `v2.1.1` release. Refs FOLIO-2369.

## [3.10.4](https://github.com/folio-org/stripes-core/tree/v3.10.4) (2019-10-15)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.10.3...v3.10.4)

* Clear registered epics during BigTest app `teardown`. Part of STRIPES-659.
* Revert PR #711, "Calling PRUNE Redux reducer", which inadvertently broke navigation. (STCOR-392)

## [3.10.3](https://github.com/folio-org/stripes-core/tree/v3.10.3) (2019-10-02)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.10.2...v3.10.3)

* Ineffectually bump `react-router` to help publish a new `latest` release (STCOR-393)

## [3.10.2](https://github.com/folio-org/stripes-core/tree/v3.10.2) (2019-10-02)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.10.1...v3.10.2)

* No changes

## [3.10.1](https://github.com/folio-org/stripes-core/tree/v3.10.1) (2019-09-27)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.10.0...v3.10.1)

* Don't overwrite existing token with empty one when returning from SSO. (STCOR-391)

## [3.10.0](https://github.com/folio-org/stripes-core/tree/v3.10.0) (2019-09-25)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.9.0...v3.10.0)

* stripes-components v5.8.0 and translations updates.

## [3.9.0](https://github.com/folio-org/stripes-core/tree/v3.9.0) (2019-09-09)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.8.0...v3.9.0)

* Use `stripes.config.js` to configure app name and caption in the UI (STCOR-385)
* Use `stripes.config.js` to configure page title (STCOR-386)
* Allow a platform to provide its own `index.html` file.
* Call `PRUNE` redux reducer when navigating among application to reduce memory consumption (UIIN-687)

## [3.8.0](https://github.com/folio-org/stripes-core/tree/v3.8.0) (2019-08-21)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.7.0...v3.8.0)

* Receive React as a peerDependency (provide by `stripes`). One dep to rule them all. Refs UIIN-678.
* Updated MainNav design to improve color contrast (STCOR-378)
* Include React a devDependency since it no longer a direct dependency. Refs UIIN-678.

## [3.7.0](https://github.com/folio-org/stripes-core/tree/v3.7.0) (2019-07-22)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.6.0...v3.7.0)

* Do not filter `okapiInterfaces` from modules' config. (STRIPES-634)
* Pass locale to Moment.js so weekdays, etc. are translated. (STCOM-512)
* Allow home-page welcome message to be customised by setting `config.welcomeMessage` to the name of a translation tag.
* Better password reset workflow. (UIU-1099)

## [3.6.0](https://github.com/folio-org/stripes-core/tree/v3.6.0) (2019-06-07)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.5.1...v3.6.0)

* Allow modules to be ingested by stripes-core as more than one type -- the `type` property of the `stripes` section is now replaced by `actsAs` which can be a module type string or an array of them. Also removes redundant copies of the icons, Okapi interfaces, and permissions in the `modules.<type>` structure exposed by the `ModulesContext` as they are kept elsewhere. (STCOR-148)
* New settings icon.
* Provide `setCurrency` on the stripes object, à la `setLocale` and `setTimezone`. Refs UIU-1040.

## [3.5.1](https://github.com/folio-org/stripes-core/tree/v3.5.1) (2019-05-13)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.5.0...v3.5.1)

* Remove special-case build rules for ui-notes. Its plugin functionality will be included in a separate module.
* Updated settings icon (STRIPES-624)
* Added pane placeholder for settings that renders when no sub-settings has been selected (UX-300)

## [3.5.0](https://github.com/folio-org/stripes-core/tree/v3.5.0) (2019-05-12)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.4.0...v3.5.0)

* Dependency updates. STRIPES-611.
* `<AppIcon>` style tweaks prevent GIGANTIC icons.

## [3.4.0](https://github.com/folio-org/stripes-core/tree/v3.4.0) (2019-04-25)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.3.0...v3.4.0)

* Resolve memory leaks and improve performance in dev re-builds. Refs STCOR-296.
* Reduce lodash footprint using [lodash-webpack-plugin](https://www.npmjs.com/package/lodash-webpack-plugin) and [babel-plugin-lodash](https://www.npmjs.com/package/babel-plugin-lodash). Refs STCOR-285.
* Minor style updates for 'My profile' icon (UX-282)
* Turn off sideEffects to enable tree-shaking for production builds. Refs STRIPES-564 and STRIPES-581.
* Expose setupStripesCore and startMirage as default exports so they can be imported directly from @folio/stripes-core/test. Refs STRIPES-565.


## [3.3.0](https://github.com/folio-org/stripes-core/tree/v3.3.0) (2019-03-28)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.2.0...v3.3.0)

* Provide React 16.8, the one with hooks! Refs STRIPES-599.

## [3.2.0](https://github.com/folio-org/stripes-core/tree/v3.2.0) (2019-03-21)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.1.0...v3.2.0)

* Don't use react-router's private history API. Refs STRIPES-614.
* Expose `stripesConnect()` HOC so that modules no longer have to solely depend on couriered `connect()`.
* Expose `<Route>` component for nested routing via react-router.

## [3.1.0](https://github.com/folio-org/stripes-core/tree/v3.1.0) (2019-03-14)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.0.4...v3.1.0)

* Provide `<AppIcon>`. (STCOM-411)
* Localize Settings and System Information strings. (STCOR-313)
* Expose 'current app' contextual dropdown to modules. (STCOR-309)
* Fixed bug where additional scrollbars would appear when opening the app dropdown (STCOM-461)
* Set current query to a correct value during initial page load. Fixes STCOR-339.
* Use stripes-components 5.1.x. (STCOR-352)

## [3.0.4](https://github.com/folio-org/stripes-core/tree/v3.0.4) (2019-03-13)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.0.3...v3.0.4)

* Make stripes dependencies more strict with ~ instead of ^. Refs STRIPES-608.


## [3.0.3](https://github.com/folio-org/stripes-core/tree/v3.0.3) (2019-01-29)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.0.2...v3.0.3)

* Provide parallel support for okapi interface users-bl 3 and 4.
* Consider framework's node_modules directory from within a Yarn workspace, fixes STCOR-323

## [3.0.2](https://github.com/folio-org/stripes-core/tree/v3.0.2) (2019-01-24)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.0.1...v3.0.2)

* Add workspace path to stripes alias resolution. Part of STCOR-320.

## [3.0.1](https://github.com/folio-org/stripes-core/tree/v3.0.1) (2019-01-17)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v3.0.0...v3.0.1)

* Require `stripes-connect` `4.x`

## [3.0.0](https://github.com/folio-org/stripes-core/tree/v3.0.0) (2019-01-15)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.17.0...v3.0.0)

* Sort the settings. Fixes STCOR-286.
* Load region-specific translations if available. Fixes STCOR-261.
* Updated webpack config to disable CSS variable preservation. Fixes STCOR-260.
* Provide default translations from `en.json` to all localizations. Fixes STCOR-310.
* Stop exposing stripes.intl

## [2.17.1](https://github.com/folio-org/stripes-core/tree/v2.17.1) (2018-12-21)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.17.0...v2.17.1)

* Update logic locating stripes-* modules to consider framework's node_modules directory, fixes STCOR-304

## [2.17.0](https://github.com/folio-org/stripes-core/tree/v2.17.0) (2018-11-29)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.16.0...v2.17.0)

* Keep all stripes attributes up to date after login. Refs STCOR-273, STRIPES-578, STCOR-283.
* Move `<IfInterface>` from `stripes-components`, STCOM-357
* Move `<IfPermission>` from `stripes-components`, STCOM-357

## [2.16.0](https://github.com/folio-org/stripes-core/tree/v2.16.0) (2018-11-06)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.15.5...v2.16.0)

* Set `textComponent` on `<IntlProvider>`
* Fixed `MainNav` not setting the correct app as `selected`.
* Add Create/Reset a Password Screen, STCOR-273
* Fix memory leaks, UIEH-570
* Keep stripes user up to date after login. Fixes STRIPES-578.

## [2.15.5](https://github.com/folio-org/stripes-core/tree/v2.15.5) (2018-11-01)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.15.4...v2.15.5)

* Turn off autoCapitalize on login form
* Deprecate stripes intl utilities, STCOR-267
* Set alt="" on app icons in MainNav (STCOR-274)
* Updated color of text in profile dropdown (STCOM-377)
* Patch response url in mirage for stripes-connect

## [2.15.4](https://github.com/folio-org/stripes-core/tree/v2.15.4) (2018-10-12)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.15.3...v2.15.4)

* Increase login form input font size
* Slim down skeleton loader
* Update CSS for hidden navigation headline
* Lean on react-intl FormattedTime for datetime construction

## [2.15.3](https://github.com/folio-org/stripes-core/tree/v2.15.3) (2018-10-05)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.15.2...v2.15.3)

* Fix CSS variable naming for breakpoints

## [2.15.2](https://github.com/folio-org/stripes-core/tree/v2.15.2) (2018-10-04)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.15.1...v2.15.2)

* Prevent mirage from auto-loading fixtures
* Update CSS vars to kebab-case

## [2.15.1](https://github.com/folio-org/stripes-core/tree/v2.15.1) (2018-10-03)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.15.0...v2.15.1)

* Remove HMR router hack
* Fix currentUser error in tests

## [2.15.0](https://github.com/folio-org/stripes-core/tree/v2.15.0) (2018-10-02)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.14.0...v2.15.0)

* Require newer `stripes-components` and `stripes-logger`

## [2.14.0](https://github.com/folio-org/stripes-core/tree/v2.14.0) (2018-10-01)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.13.0...v2.14.0)

* Add `react-hot-loader` to development environment
* Remove notifications, STCOR-257
* Use new type stack
* Make current app clickable, STCOR-255
* Create `setupStripesCore()` test helper

## [2.13.0](https://github.com/folio-org/stripes-core/tree/v2.13.0) (2018-09-18)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.12.0...v2.13.0)

* Support mod-login-saml's requirement for the new authtoken interface in addition to the old interface. Refs STCOR-76. Available from v2.12.1.
* Expose timeZone through react-intl provider
* Export classes and functions intended for external use
* Extract `lastVisited` to a separate higher order component. Fixes STCOR-254. Available from v2.12.2.

## [2.12.0](https://github.com/folio-org/stripes-core/tree/v2.12.0) (2018-09-13)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.11.0...v2.12.0)

* Added ability to set the current user's service points in the session object. Available from 2.11.1. Enables UIU-551.
* Refactor handler events to strings. Part of UIU-551.
* `isVersionCompatible` accepts a space-separated list of wanted versions. Available from v2.11.2. Fixes STCOR-249.
* The `<Pluggable>` component is moved into stripes-core from stripes-components. Available from v2.11.3. References STCOM-331.
* Upgrade `debug` dependency, STRIPES-553

## [2.11.0](https://github.com/folio-org/stripes-core/tree/v2.11.0) (2018-09-04)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.10.0...v2.11.0)

* New context API, RootContext. Legacy context API should be removed in next major version. Fixes STCOR-208. Available from v2.10.4.
* Upgrade to Webpack 4. Fixes STCOR-175 and STCOR-217.
* Limit icons generated to reduce dev build time. Fixes STCOR-232.
* Added `<TitleManager>` to help compose `document.title`. Fixes STCOR-226.
* Added `<TitledRoute>` component to clean up generic, non-module routing.
* Added `ModulesContext` and `withModule` and `withModules` HOCs for module i18n. Fixes STCOR-228.
* Update react-intl-safe-html version. Part of STRIPES-545.
* Automatically select service point preference when logging in. Fixes STCOR-235.
* Manually select service point at login when no preference is specified. Fixes STCOR-237.
* Introduce a new ui module type: handler. Fixes STCOR-240. Available from v2.10.6
* Support link-checking functions that are actual functions, as well as names. Fixes STCOR-247. Available from v2.10.7.
* Update [the Developer's Guide](doc/dev-guide.md) with new sections on [handlers](doc/dev-guide.md#handlers-and-events) and [links](doc/dev-guide.md#links). Also, some restructuring. Fixes STCOR-246.
* Introduce `SELECT_MODULE` event. Part of UICHKOUT-433 and UICHKIN-32.
* Declare all Stripes-object properties in `stripesShape`. Fixes STCOR-236. Available from v2.10.5.
* Update release procedure to guard against publishing with unreleased dependencies, STCOR-225
* Add new utility script, [`util/checkdeps`](util/checkdeps), to check for unreleased dependencies.
* In [the Developer's Guide](doc/dev-guide.md), document the pattern for specifying limits. Fixes STCOR-239.
* Fix typo in [The Stripes Module Developer's Guide](doc/dev-guide.md). Fixes STCOR-227.
* Add new document, [_Settings and Preferences_](doc/settings-and-preferences.md), discussing the distinction and outlining implementation options. Addresses the concerns of UIP-1.

## [2.10.0](https://github.com/folio-org/stripes-core/tree/v2.10.0) (2018-06-06)
[Full Changelog](https://github.com/folio-org/stripes-core/compare/v2.9.0...v2.10.0)

* Translation plugin looks for language files in folder `translations/moduleName` at first. If there is no translation in that folder it falls back to `translations` folder to provide backward compatibility. Fixes STCOR-211.
* Update [Creating a new development setup for Stripes](doc/new-development-setup.md) for `stripes-cli`-based workflow and add `configure` script. Fixes STCOR-140.
* New document, [Depending on unreleased features](doc/depending-on-unreleased-features.md). Fixes STCOR-152.
* Update docs to reflect that "stripescli" is now "stripes". Refs STCLI-11.
* Remove ui-okapi-console from pull-stripes; it's deprecated. Fixes STCOR-156.
* Add notes about stripes-cli install trouble. Fixes STCOR-154.
* Lint. It's what's for dinner. Fixes STCOR-157.
* `ui-items`, which is deprecated, is no longer included in `pull-stripes`. Refs UIIN-18.
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
* Add rule to webpack's file-loader configuration to support audio files. Fixes STCOR-184.
* Update "configure" script to use a Yarn workspace. Fixes STCOR-185.
* Fix typos in workspace-creation section of [_Creating a new development setup_ document](doc/new-development-setup.md). Fixes STCOR-186.
* Add [i18n best practices documentation](doc/i18n.md). Fixes STCOR-182.
* Upgrade react-apollo dependency to v2.1.3. Fixes STCOR-188.
* Add overlay container div for system-level communications, dropdowns, modals etc.; modified z-index of MainNav, ModuleContainer, OverlayContainer so that components within these containers can apply their own z-indexes without collision or unwanted overlap. Implements STCOR-187
* Add diagnostic output to stripes builds, STCOR-141.
* Set @folio's NPM registry before using it. Duh. Fixes STCOR-193. Available from v2.9.5.
* Added React Error Boundary to catch errors thrown during render(), implementing STCOR-150.
* Retrieve tenant module details in one swell foop. Fixes STCOR-200. Available from v2.9.6.
* Add build option to disable JS minification, STCOR-197
* Upgrade required version of hard-source-webpack-plugin, and thereby of leveldown. Fixes STCOR-210.
* Include ui-vendors in pull-stripes.
* Added visual skeleton when system is loading. Fixes STCOR-169.
* I18n-ify login page. Fixes STCOR-213.
* Update dependency on `users-bl` corresponding with UIU-495.
* Introduce `stripes-metadata-plugin`. Fixes STCOR-139.
* Resolve "TypeError: modPackageJsonPath.replace is not a function". Fixes STCOR-143.
* Quieten the webpack output. Fixes STCOR-144.
* Fix Node v9.x module resolution errror. Fixes STCOR-163.
* Fix StripesBuildError with Yarn workspaces. Fixes STCOR-170.
* Update Node.js version requirement from 6.x to >=8.11.1. Fixes STCOR-192.
* Remove unused "button.discardChanges" translation key. Fixes STCOR-201.

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
* Updated NavButton to use new universal interaction styles (from stripes-components)
* Updated NotificationsMenu and Settings to use NavListItem instead of Button's and Link's

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
