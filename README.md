# Stripes Core

Copyright (C) 2016-2019 The Open Library Foundation

This software is distributed under the terms of the Apache License,
Version 2.0. See the file "[LICENSE](LICENSE)" for more information.

## Introduction

Stripes is a toolkit for building single-page web applications that FOLIO UI modules can run in. UI modules are made up of [React](https://facebook.github.io/react/) components, some of which will be connected to back-end services provided by [Okapi](https://github.com/folio-org/okapi). Each module has a "type" which indicates how it functions within the application. At the moment, the only "type" is "app" which provides a top-level component to render into a large content area.


## Documentation roadmap

The documentation roadmap has moved.  Please refer to the [Stripes](https://github.com/folio-org/stripes) Github repository for general Stripes information, guides, and assistance setting up a development environment.


## Stripes-core documentation

* [Permissions in Stripes and FOLIO](doc/permissions.md)
* [Stripes application metadata bundles](doc/app-metadata.md)
* [An example component: the **PluginType** component](doc/component-example.md) walks through a simple example of a component that is connected to the back-end service using Stripes Connect.
* [A component hierarchy example: the "Patrons" module](doc/component-hierarchy.md) shows by example how a set of components -- some connected, some not -- can work together to implement part of an application. **NOTE that this is somewhat out of date**, but still helpfully illustrative.
* [Adding new permissions to FOLIO UI modules](doc/adding-permissions.md).
* UX and implementation concerns for [Settings and Preferences](doc/settings-and-preferences.md)


## Additional information

See project [STRPCORE](https://issues.folio.org/browse/STRPCORE)
at the [FOLIO issue tracker](https://dev.folio.org/guidelines/issue-tracker/).

Other FOLIO Developer documentation is at [dev.folio.org](https://dev.folio.org/)
