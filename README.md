# Stripes Core

Copyright (C) 2016 The Open Library Foundation

This software is distributed under the terms of the Apache License,
Version 2.0. See the file "[LICENSE](LICENSE)" for more information.

## Introduction

This is a single-page web application that provides a platform for React components from configured modules according to their "type". At the moment, the only "type" is "app" which provides a component to render into a large content area.


## Documentation roadmap

* Quick start guide: [read on below](#quick-start)
* [Overview of the Stripes architecture](doc/overview.md)
* [Running Stripes from git checkouts](doc/building-from-git-checkouts.md)
* [Running a complete FOLIO system](https://github.com/folio-org/ui-okapi-console/blob/master/doc/running-a-complete-system.md)
* [The stripes-connect API](https://github.com/folio-org/stripes-connect/blob/master/api.md)
* [A component example: the **PatronEdit** component](doc/component-example.md)
* [A component hierarchy example: the "Patrons" module](doc/component-hierarchy.md)


## <a name="quick-start">Quick start</a>

To run Stripes, you'll need to have [Node.js](https://nodejs.org/) 6.x installed.
```
node --version
v6.8.0
```

### Very quick

```
cd stripes-core
npm config set @folio:registry https://repository.folio.org/repository/npm-folio/
npm install
npm config set @folio-sample-modules:registry https://repository.folio.org/repository/npm-folio/
npm install @folio-sample-modules/trivial
npm start
```

### Some details

Add the FOLIO NPM registry to your local NPM configuration:

`npm config set @folio:registry https://repository.folio.org/repository/npm-folio/`

Retrieve the necessary dependencies:

`npm install`

At this point you have what you need to run the system. Edit `webpack.config.cli.js` to indicate which modules you want to include and the URL to the back end. Run `npm start` to bring up a development server at http://localhost:3000/ or `npm run build` to output a set of files which can then be deployed to a web server.

### Demos

We have some sample modules to play with in the `@npm-sample-modules` scope on our registry. Run this to let it know where to look:

`npm config set @folio-sample-modules:registry https://repository.folio.org/repository/npm-folio/`

#### trivial

The default configuration references a module, "trivial", which demonstrates a simple use of "stripes-connect". You can install it via npm:

`npm install @folio-sample-modules/trivial`

#### trivial-okapi

Another demo, "trivial-okapi", shows the most basic communication with the [Okapi](https://github.com/folio-org/okapi) API gateway and will require a connection to it in order to run. It lists tenants and allows their deletion. This simple exercise only relies on Okapi rather than a collection of services so it's relatively easy to set up locally without needing Docker.

After following build instructions in the [Okapi repository](https://github.com/folio-org/okapi) to get the service running, you can install the demo as below and activate it by editing `stripes.config.js` before starting the dev server or building a bundle. If you have yet to create this file, copy `stripes.config.js.example` as a base.

`npm install @folio-sample-modules/trivial-okapi`

## Including a module under development

Both `stripes-loader` and `stripes-core` need to be able to resolve a `require()` of the string you use to reference your module when including it in `stripes.config.js` which governs which modules webpack bundles. One convenient approach is to place a symbolic link to it in `node_modules/@folio` or `node_modules/@folio-sample-modules` as these are already included in Webpack's search path.

For example, to include `some-module` from `/devstuff/some-module`: 

```
cd stripes-core/node_modules/@folio-sample-modules
ln -s /devstuff/some-module .
```
