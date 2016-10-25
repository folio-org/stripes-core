Stripes: a modular toolkit for user interfaces
==============================================

Introduction
------------

Stripes is part of the open library services platform
[Folio](http://www.folio.org/). The goal of Folio is that third-party
developers will be able to contribute moduls that slide easily into
place as part of a library' IT infrastructure -- for example, an
acquisitions module or integration with an institutional respository.

Folio modules run on clouds of servers -- either hosted commercially
by SAAS providers like EBSCO, or hosted locally by institutions that
prefer to take on this kind of infrastructure work. These modules
provide their services via RESTful APIs. But the way Folio
functionality is exposed to users (whether librarians, administrators
or patrons) is in a Web browser. Each Folio module is fronted by a
Stripes module which makes its functionality available to users.

> (Actually, that's a bit of a simplification. A given Folio module
> may be represented more than one Stripes module. for example, two
> different Stripes Loans modules might present different views of the
> loan process, one more suited to academic libraries and one to
> public libraries. Then anotber vendor might come along and offer a
> third alternative: a slicker public-library loans UI to compete with
> the existing one. Stripes allows different alternative modules to be
> slipped into place.)

Stripes modules present themselves as a set of one of more
[React](https://facebook.github.io/react/) components. Full-page
components also specify information on how to route various URL paths
and menu items to those paths. Module authors will need to understand
React (but will be largely insulated from the details of related
modules such as Redux).


Software Overview
-----------------

As so often in programming, the price of simplicity is complexity. To
make modules neatly pluggable like this, we have to do a lot of work
behind the scenes. As a result, while Stripes should be easy for
module developers to _use_, it's not the easiest piece of software to
uderstand the internals of. Note that what follows is only of interest
to those working _on_ Stripes, not those working _with_ it.

At present, Stripes itself consists of three modules, each of them
packaged using NPM:

* [**stripes-core**](https://github.com/folio-org/stripes-experiments/tree/master/stripes-core):
  the core of system, including the web-application's
  `index.html` and `index.js`. Also includes some utilities that are
  used by the other modules.

* [**stripes-connect**](https://github.com/folio-org/stripes-experiments/tree/master/stripes-connect):
  Code that connects Stripes modules with sources of data, notably the
  Okapi middleware that exposes Folio services.

* [**stripes-loader**](https://github.com/folio-org/stripes-loader):
  A Webpack loader that gathers and configures the selected set of
  modules that will make up a particular Stripes application.

Besides these core modules, there are a small number of Stripes
modules available for inclusion in applicatiobs. At present these are
strictly proof of concept modules, and do not do anything useful:

* [**trivial**](https://github.com/folio-org/stripes-experiments/tree/master/trivial):
  A "hello world" module that can express various greetings to
  different people.

Going forward, it's possible that the Stripes code will be split into
more modules -- for example, we may separate out the code for
communicating with Okapi. And it is a certainty that there will be
many more application modules, including those created by other
parties.


How it all ties together
------------------------

Hold on to your hats -- this is a bit complicated. The crucial point
is that, while stripes-core and stripes-connect are parts of the
runtime system that supports Stripes components, stripes-loader runs
at _compile_ time in order to gather all the included modules. Here's
how we make it happen.

* NPM is the Node Package Manager. Although it started out as part of
  Node, it's now more or less the universally used mechanism for
  distributing packages of JavaScript code. When NPM builds a package,
  it uses various tools including Webpack.

* Webpack is a module bundler. It takes the many separate JavaScript,
  HTML and CSS files that make up a typical JavaScript library, and
  bundles them into one or more "static assets". At its very simplest,
  it just concatenates a bunch of JavaScript files into one.

* Webpack handles different kinds of files in different ways. For
  example, depending on how it's configured, it might run ES6 (modern
  JavaScript) through a translator called Babel to convert into and
  older version of JavaScript that runs in more browsers. The way
  Webpack does this is with "loaders". A Webpack loader is a piece of
  code invoked by Webpack when it's compiling a set of resources down
  into static assets. Loaders can also be explicitly invoked, as we
  will see later.

* When the `stripes-core` module is compiled:

    * It begins with `stripes-core/src/index.js`.
    * This imports the file `Root.js` (so it can render the React
      component `<Root>`).
    * `Root.js` imports `routes.js` (so it can pass the routes into the
      React component `<Router>`.
    * `routes.js` contains the magical incantation:
      `import { routes as moduleRoutes } from 'stripes-loader!';`

* That's where the magic happens. Usually when Webpack sees an
  `import` statement, it includes the named source file. But when the
  import is of the form _loaderName_`!`_fileName_, it invokes the
  named Webpack loader, passing it the contents of the nominated
  `fileName`. In this case, there is no named file, so the named
  loader is invoked. This is how `stripes-loader` is run as part of
  the build process for `stripes-core`.

* The stripes-loader software obtains a list of which Stripes modules
  are to be bundled. How does it do this? At present, it simply reads
  them from the WebPack config file in stripes-core -- for example,
  `webpack.config.prod.js`. But in the longer term, it will obtain
  this information dynamically from Okapi.

* Each module that is specified for inclusion must provide information
  about the routes and menus that it provides. At present, this is
  placed in the `routes.json` and `menus.json` files, but it could in
  future be included directly in the `package.json`. The module must
  also provide all the React components that are named in the routes
  and menus.

