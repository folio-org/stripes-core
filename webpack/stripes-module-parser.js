const path = require('path');
const _ = require('lodash');
const modulePaths = require('./module-paths');
const StripesBuildError = require('./stripes-build-error');

function appendOrSingleton(maybeArray, newValue) {
  const singleton = [newValue];
  if (Array.isArray(maybeArray)) return maybeArray.concat(singleton);
  return singleton;
}

// Handles the parsing of one Stripes module's configuration and metadata
class StripesModuleParser {
  constructor(moduleName, overrideConfig, context, aliases) {
    this.moduleName = moduleName;
    this.modulePath = '';
    this.nameOnly = moduleName.replace(/.*\//, '');
    this.overrideConfig = overrideConfig;
    this.packageJson = this.loadModulePackageJson(context, aliases);
    this.warnings = [];
  }

  // Loads a given module's package.json and errors when it fails
  // By using require, the JSON will already be parsed
  loadModulePackageJson(context, aliases) {
    const packageJsonFile = modulePaths.locateStripesModule(context, this.moduleName, aliases, 'package.json');
    if (!packageJsonFile) {
      throw new StripesBuildError(`StripesModuleParser: Unable to locate ${this.moduleName}'s package.json`);
    }
    this.modulePath = packageJsonFile.replace('package.json', '');
    return require(packageJsonFile); // eslint-disable-line
  }

  // Wrapper to source data and transform into collections (config and metadata)
  parseModule() {
    return {
      name: this.nameOnly,
      type: this.packageJson.stripes.type,
      config: this.config || this.parseStripesConfig(this.moduleName, this.packageJson),
      metadata: this.metadata || this.parseStripesMetadata(this.packageJson),
    };
  }

  // Validates and parses a module's stripes data
  // One critical aspect of this operation is value of getModule, which is the entry point into each app
  // This will be modified to a webpack-compatible dynamic import when we implement code-splitting.
  parseStripesConfig(moduleName, packageJson) {
    const { stripes, description, version } = packageJson;

    if (!_.isObject(stripes)) {
      throw new StripesBuildError(`Included module ${moduleName} does not have a "stripes" key in package.json`);
    }
    if (!_.isString(stripes.type)) {
      throw new StripesBuildError(`Included module ${moduleName} does not specify stripes.type in package.json`);
    }

    const stripeConfig = Object.assign({}, stripes, this.overrideConfig, {
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
  parseStripesMetadata(packageJson) {
    const icons = this.getIconMetadata(packageJson.stripes.icons, packageJson.stripes.type === 'app');
    const welcomePageEntries = this.getWelcomePageEntries(packageJson.stripes.welcomePageEntries, icons);

    const metadata = {
      name: this.nameOnly,
      version: packageJson.version,
      description: packageJson.description,
      license: packageJson.license,
      feedback: packageJson.bugs,
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

  getIconMetadata(icons, isApp) {
    if (!icons || !Array.isArray(icons)) {
      if (isApp) this.warnings.push(`Module ${this.moduleName} has no icons defined in stripes.icons`);
      return {};
    }
    return _.reduce(icons, (iconMetadata, icon) => {
      iconMetadata[icon.name] = {
        alt: icon.alt,
        title: icon.title,
      };
      // The icon's name will be used in the event fileName is not specified
      Object.assign(iconMetadata[icon.name], this.buildIconFilePaths(icon.fileName || icon.name));
      return iconMetadata;
    }, {});
  }

  // Construct and validate expected icon file paths
  buildIconFilePaths(name) {
    const iconDir = 'icons';
    const defaultKey = 'high';
    const iconVariants = {
      high: `${name}.svg`,
      low: `${name}.png`,
      // bw: `${name}-bw.png`, example
    };

    return _.reduce(iconVariants, (iconPaths, file, key) => {
      const iconFilePath = path.join(this.modulePath, iconDir, file);
      const isFound = modulePaths.tryResolve(iconFilePath);
      if (!isFound) {
        this.warnings.push(`Module ${this.moduleName} defines icon "${name}" but is missing file "${iconDir}/${file}"`);
      }
      iconPaths[key] = {
        src: isFound ? iconFilePath : '',
      };
      if (key === defaultKey) {
        iconPaths.src = isFound ? iconFilePath : '';
      }
      return iconPaths;
    }, {});
  }

  getWelcomePageEntries(entries, icons) {
    if (!entries || !Array.isArray(entries)) {
      return [];
    }
    return _.map(entries, (entry) => {
      if (!icons[entry.iconName]) {
        this.warnings.push(`Module ${this.moduleName} defines welcome page entry icon "${entry.iconName}" with no matching stripes.icons definition`);
      }
      return {
        iconName: entry.iconName,
        headline: entry.headline,
        description: entry.description,
      };
    });
  }
}

// The helper loops over a tenant's enabled modules and parses each module
// The resulting config is grouped by stripes module type (app, settings, plugin, etc.)
// The metadata is grouped by module name
function parseAllModules(enabledModules, context, aliases) {
  const allModuleConfigs = {};
  const allMetadata = {};
  let warnings = [];

  _.forOwn(enabledModules, (overrideConfig, moduleName) => {
    const moduleParser = new StripesModuleParser(moduleName, overrideConfig, context, aliases);
    const parsedModule = moduleParser.parseModule();
    allModuleConfigs[parsedModule.type] = appendOrSingleton(allModuleConfigs[parsedModule.type], parsedModule.config);
    allMetadata[parsedModule.name] = parsedModule.metadata;
    if (moduleParser.warnings.length) {
      warnings = warnings.concat(moduleParser.warnings);
    }
  });

  return {
    config: allModuleConfigs,
    metadata: allMetadata,
    warnings,
  };
}

module.exports = {
  StripesModuleParser,
  parseAllModules,
};
