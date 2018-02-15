const _ = require('lodash');
const modulePaths = require('./module-paths');
const StripesBuildError = require('./stripes-build-error');

function appendOrSingleton(maybeArray, newValue) {
  const singleton = [newValue];
  if (Array.isArray(maybeArray)) return maybeArray.concat(singleton);
  return singleton;
}

module.exports = class StripesModuleParser {
  constructor(enabledModules, context, aliases) {
    this.enabledModules = enabledModules;
    this.context = context;
    this.aliases = aliases;
  }

  loadModulePackageJson(moduleName) {
    const packageJson = modulePaths.locateStripesModule(this.context, moduleName, this.aliases, 'package.json');
    if (!packageJson) {
      throw new StripesBuildError(`Unable to locate ${moduleName}'s package.json`);
    }
    return require(packageJson); // eslint-disable-line
  }

  parseModule(moduleName) {
    const packageJson = this.loadModulePackageJson(moduleName);
    const config = this.parseStripesConfig(moduleName, packageJson);
    // const metadata = this.parseStripesMetadata(packageJson);

    const parsedModule = {
      name: moduleName,
      type: packageJson.stripes.type,
      config,
      // metadata,
    };
    return parsedModule;
  }

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

  // parseStripesMetadata(packageJson) {
  //   const metadata = {};
  //   return metadata;
  // }

  parseEnabledModules() {
    const moduleConfigs = {};
    _.forOwn(this.enabledModules, (moduleConfig, moduleName) => {
      const parsedModule = this.parseModule(moduleName);
      moduleConfigs[parsedModule.type] = appendOrSingleton(moduleConfigs[parsedModule.type], parsedModule.config);
    });
    return moduleConfigs;
  }
};
