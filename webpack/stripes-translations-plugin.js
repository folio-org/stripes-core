const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const { locateStripesModule } = require('./module-paths');

function prefixKeys(obj, prefix) {
  const res = {};
  for (const key of Object.keys(obj)) {
    res[`${prefix}${key}`] = obj[key];
  }
  return res;
}

module.exports = class StripesTranslationPlugin {
  constructor(options) {
    // Include stripes-core because it has translations too
    this.modules = {
      '@folio/stripes-core': {},
    };
    Object.assign(this.modules, options); // options.modules
  }

  apply(compiler) {
    // Used to help locate modules
    this.context = compiler.context;
    this.aliases = compiler.options.resolve.alias;

    // Gather all translations available in each module
    const allTranslations = this.gatherAllTranslations();
    this.allFiles = StripesTranslationPlugin.generateFileNames(allTranslations);

    // Emit merged translations to the output directory
    compiler.plugin('emit', (compilation, callback) => {
      Object.keys(allTranslations).forEach((language) => {
        const content = JSON.stringify(allTranslations[language]);
        compilation.assets[this.allFiles[language]] = {
          source: () => content,
          size: () => content.length,
        };
      });
      callback();
    });
  }

  gatherAllTranslations() {
    const allTranslations = {};
    // Locate each module's translations directory (current) or package.json data (fallback)
    for (const mod of Object.keys(this.modules)) {
      const modPackageJsonPath = locateStripesModule(this.context, mod, this.aliases, 'package.json');
      const modTranslationDir = modPackageJsonPath.replace('package.json', 'translations');

      if (fs.existsSync(modTranslationDir)) {
        _.merge(allTranslations, StripesTranslationPlugin.loadTranslationsDirectory(mod, modTranslationDir));
      } else {
        _.merge(allTranslations, StripesTranslationPlugin.loadTranslationsPackageJson(mod, modPackageJsonPath));
      }
    }
    return allTranslations;
  }

  static loadTranslationsDirectory(moduleName, dir) {
    const moduleTranslations = {};
    for (const translationFile of fs.readdirSync(dir)) {
      const language = translationFile.replace('.json', '');
      const translations = require(path.join(dir, translationFile)); // eslint-disable-line global-require, import/no-dynamic-require, because we're building something here
      moduleTranslations[language] = StripesTranslationPlugin.prefixModuleKeys(moduleName, translations);
    }
    return moduleTranslations;
  }

  // Maintains backwards-compatibility with existing apps
  static loadTranslationsPackageJson(moduleName, packageJsonPath) {
    const moduleTranslations = {};
    const packageJson = require(packageJsonPath); // eslint-disable-line global-require, import/no-dynamic-require, because we're building something here
    if (packageJson.stripes && packageJson.stripes.translations) {
      // TODO: Map?
      for (const language of Object.keys(packageJson.stripes.translations)) {
        moduleTranslations[language] = StripesTranslationPlugin.prefixModuleKeys(moduleName, packageJson.stripes.translations[language]);
      }
    }
    return moduleTranslations;
  }

  static prefixModuleKeys(moduleName, translations) {
    const name = moduleName.replace(/.*\//, '');
    const prefix = name === 'stripes-core' ? `${name}.` : `ui-${name}.`;
    return prefixKeys(translations, prefix);
  }

  // Assign output path names for each to be accessed later by stripes-config-plugin
  static generateFileNames(allTranslations) {
    const files = {};
    const timestamp = Date.now(); // To facilitate cache busting, could also generate a hash
    Object.keys(allTranslations).forEach((language) => {
      files[language] = `translations/${language}-${timestamp}.json`;
    });
    return files;
  }
};
