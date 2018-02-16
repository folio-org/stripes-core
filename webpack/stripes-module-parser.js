const _ = require('lodash');
const modulePaths = require('./module-paths');
const StripesBuildError = require('./stripes-build-error');

function appendOrSingleton(maybeArray, newValue) {
  const singleton = [newValue];
  if (Array.isArray(maybeArray)) return maybeArray.concat(singleton);
  return singleton;
}

function nameOnly(moduleName) {
  return moduleName.replace(/.*\//, '');
}

module.exports = class StripesModuleParser {
  constructor(enabledModules, context, aliases) {
    this.enabledModules = enabledModules;
    this.context = context;
    this.aliases = aliases;
  }

  // Loads a given module's package.json and errors when it fails
  // By using require, the JSON will already be parsed
  loadModulePackageJson(moduleName) {
    const packageJson = modulePaths.locateStripesModule(this.context, moduleName, this.aliases, 'package.json');
    if (!packageJson) {
      throw new StripesBuildError(`Unable to locate ${moduleName}'s package.json`);
    }
    return require(packageJson); // eslint-disable-line
  }

  // Wrapper to source data and transform into collections (config and metadata)
  parseModule(moduleName) {
    const packageJson = this.loadModulePackageJson(moduleName);
    const config = this.parseStripesConfig(moduleName, packageJson);
    const metadata = StripesModuleParser.parseStripesMetadata(packageJson);

    const parsedModule = {
      name: nameOnly(moduleName),
      type: packageJson.stripes.type,
      config,
      metadata,
    };
    return parsedModule;
  }

  // Validates and parses a module's stripes data
  // One critical aspect of this operation is value of getModule, which is the entry point into each app
  // This will be modified to a webpack-compatible dynamic import when we implement code-splitting.
  parseStripesConfig(moduleName, packageJson) {
    const { stripes, description, version } = packageJson;
    const tenantModuleConfig = this.enabledModules[moduleName];

    if (!_.isObject(stripes)) {
      throw new StripesBuildError(`Included module ${moduleName} does not have a "stripes" key in package.json`);
    }
    if (!_.isString(stripes.type)) {
      throw new StripesBuildError(`Included module ${moduleName} does not specify stripes.type in package.json`);
    }

    const stripeConfig = Object.assign({}, stripes, tenantModuleConfig, {
      module: moduleName,
      getModule: new Function([], `return require('${moduleName}').default;`), // eslint-disable-line no-new-func
      description,
      version,
    });
    delete stripeConfig.type;
    return stripeConfig;
  }

  // Extract metadata defined here:
  // https://github.com/folio-org/stripes-core/blob/master/doc/app-metadata.md
  static parseStripesMetadata(packageJson) {
    // Name without @folio/ scope
    const icons = StripesModuleParser.getIconMetadata(packageJson.stripes.icons);
    const welcomePageEntries = StripesModuleParser.getWelcomePageEntries(packageJson.stripes.welcomePageEntries, icons, packageJson.name);

    const metadata = {
      name: nameOnly(packageJson.name),
      version: packageJson.version,
      description: packageJson.description,
      license: packageJson.license,
      feedback: {
        url: packageJson.bugs ? packageJson.bugs.url : undefined,
        email: packageJson.bugs ? packageJson.bugs.email : undefined,
      },
      type: packageJson.stripes.type,
      shortTitle: packageJson.stripes.displayName,
      fullTitle: packageJson.stripes.fullName,
      defaultPopoverSize: packageJson.stripes.defaultPopoverSize,
      defaultPreviewWidth: packageJson.stripes.defaultPreviewWidth,
      helpPage: packageJson.stripes.helpPage,
      icons,
      welcomePageEntries,
    };

    return metadata;
  }

  static getIconMetadata(icons) {
    if (!icons || !Array.isArray(icons)) {
      return {};
    }
    return _.reduce(icons, (iconMetadata, icon) => {
      iconMetadata[icon.name] = {
        filename: icon.filename,
        alt: icon.alt,
        title: icon.title,
      };
      return iconMetadata;
    }, {});
  }

  static getWelcomePageEntries(entries, icons, name) {
    if (!entries || !Array.isArray(entries)) {
      return [];
    }
    return _.map(entries, (entry) => {
      if (!icons[entry.iconName]) {
        console.warn(`Welcome page entry icon "${entry.iconName}" has no icon defined in stripes.icons for module ${name}`);
        // throw new StripesBuildError(`Welcome page entry icon "${entry.iconName}" has no icon defined in stripes.icons for module ${name}`);
      }
      return {
        iconName: entry.iconName,
        headline: entry.headline,
        description: entry.description,
      };
    });
  }

  // Loops over all the tenant's module configs and parses each
  // The resulting config is grouped by stripes module type (app, settings, plugin, etc.)
  parseEnabledModules() {
    const moduleConfigs = {};
    const metadata = {};

    _.forOwn(this.enabledModules, (moduleConfig, moduleName) => {
      const parsedModule = this.parseModule(moduleName);
      moduleConfigs[parsedModule.type] = appendOrSingleton(moduleConfigs[parsedModule.type], parsedModule.config);
      metadata[parsedModule.name] = parsedModule.metadata;
    });

    return {
      moduleConfigs,
      metadata,
    };
  }
};
