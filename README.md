# Stripes Core

Copyright (C) 2016-2018 The Open Library Foundation

This software is distributed under the terms of the Apache License,
Version 2.0. See the file "[LICENSE](LICENSE)" for more information.

## Introduction

Stripes is a toolkit for building single-page web applications that FOLIO UI modules can run in. UI modules are made up of [React](https://facebook.github.io/react/) components, some of which will be connected to back-end services provided by [Okapi](https://github.com/folio-org/okapi). Each module has a "type" which indicates how it functions within the application. At the moment, the only "type" is "app" which provides a top-level component to render into a large content area.


## Documentation roadmap

* [Quick start guide](doc/quick-start.md) will allow you get Stripes up and running with a couple of sample modules downloaded using NPM, and to run locally a developed module.
* [Overview of the Stripes architecture](doc/overview.md) explains the concepts that guided the design of Stripes.
* [Stripes entities: packages, modules, apps and more](doc/modules-apps-etc.md)
* [Creating a new development setup for Stripes](doc/new-development-setup.md)
* [Running a complete FOLIO system](https://github.com/folio-org/ui-okapi-console/blob/master/doc/running-a-complete-system.md) goes further into explaining how you can also run your own instances of FOLIO's API gateway Okapi and application service modules, and how you can use the Okapi Console (running as part of Stripes) to manage modules and tenants.
* [The Stripes Module Developer's Guide](doc/dev-guide.md)
* [Permissions in Stripes and FOLIO](doc/permissions.md)
* [Stripes application metadata bundles](doc/app-metadata.md)
* [The stripes-connect API](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md) describes how to use [Stripes Connect](https://github.com/folio-org/stripes-connect), the part of the Stripes toolkit that allows you to declaratively express what data you want to share with back-end services.
* [An evolving troubleshooting guide](doc/troubleshooting.md).
* [The release procedure](doc/release-procedure.md) for the packages that make up Stripes.
* [Depending on unreleased features](doc/depending-on-unreleased-features.md)
* [An example component: the **PluginType** component](doc/component-example.md) walks through a simple example of a component that is connected to the back-end service using Stripes Connect.
* [A component hierarchy example: the "Patrons" module](doc/component-hierarchy.md) shows by example how a set of components -- some connected, some not -- can work together to implement part of an application. **NOTE that this is somewhat out of date**, but still helpfully illustrative.
* [Adding new permissions to FOLIO UI modules](doc/adding-permissions.md).

## Additional information

See project [STRPCORE](https://issues.folio.org/browse/STRPCORE)
at the [FOLIO issue tracker](http://dev.folio.org/community/guide-issues).

Other FOLIO Developer documentation is at [dev.folio.org](http://dev.folio.org/)
