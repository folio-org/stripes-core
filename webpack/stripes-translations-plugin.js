const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
const modulePaths = require('./module-paths');

function prefixKeys(obj, prefix) {
  const res = {};
  for (const key of Object.keys(obj)) {
    res[`${prefix}${key}`] = obj[key];
  }
  return res;
}

module.exports = class StripesTranslationPlugin {
  constructor(options) {
    // Include stripes-core et al because they have translations
    this.modules = {
      '@folio/stripes-core': {},
      '@folio/stripes-components': {},
      '@folio/stripes-smart-components': {},
    };
    Object.assign(this.modules, options.modules);
    this.languageFilter = options.config.languages || [];
  }

  apply(compiler) {
    // Used to help locate modules
    this.context = compiler.context;
    this.publicPath = compiler.options.output.publicPath;
    this.aliases = compiler.options.resolve.alias;

    // Limit the number of languages loaded by third-party libraries with the ContextReplacementPlugin
    if (this.languageFilter.length) {
      const filterRegex = new RegExp(`(${this.languageFilter.join('|')})`); // constructed regex will look something like /(en|es)/
      compiler.apply(new webpack.ContextReplacementPlugin(/react-intl[/\\]locale-data/, filterRegex));
      compiler.apply(new webpack.ContextReplacementPlugin(/moment[/\\]locale/, filterRegex));
    }

    // Gather all translations available in each module
    const allTranslations = this.gatherAllTranslations();
    const fileData = this.generateFileNames(allTranslations);
    this.allFiles = _.mapValues(fileData, data => data.browserPath); // stripes-config-plugin will grab "allFiles" for fetching in the browser

    // Emit merged translations to the output directory
    compiler.plugin('emit', (compilation, callback) => {
      Object.keys(allTranslations).forEach((language) => {
        const content = JSON.stringify(allTranslations[language]);
        compilation.assets[fileData[language].emitPath] = {
          source: () => content,
          size: () => content.length,
        };
      });
      callback();
    });
  }

  // Locate each module's translations directory (current) or package.json data (fallback)
  gatherAllTranslations() {
    const allTranslations = {};
    for (const mod of Object.keys(this.modules)) {
      const modPackageJsonPath = modulePaths.locateStripesModule(this.context, mod, this.aliases, 'package.json');
      if (modPackageJsonPath) {
        const modTranslationDir = modPackageJsonPath.replace('package.json', 'translations');
        if (fs.existsSync(modTranslationDir)) {
          _.merge(allTranslations, this.loadTranslationsDirectory(mod, modTranslationDir));
        } else {
          _.merge(allTranslations, this.loadTranslationsPackageJson(mod, modPackageJsonPath));
        }
      } else {
        console.log(`Unable to locate ${mod} while looking for translations.`);
      }
    }
    return allTranslations;
  }

  // Load translation *.json files from a single module's translation directory
  loadTranslationsDirectory(moduleName, dir) {
    const moduleTranslations = {};
    for (const translationFile of fs.readdirSync(dir)) {
      const language = translationFile.replace('.json', '');
      // When filter is set, skip other languages. Otherwise loads all
      if (!this.languageFilter.length || this.languageFilter.includes(language)) {
        const translations = StripesTranslationPlugin.loadFile(path.join(dir, translationFile));
        moduleTranslations[language] = StripesTranslationPlugin.prefixModuleKeys(moduleName, translations);
      }
    }
    return moduleTranslations;
  }

  // Maintains backwards-compatibility with existing apps
  loadTranslationsPackageJson(moduleName, packageJsonPath) {
    const moduleTranslations = {};
    const packageJson = StripesTranslationPlugin.loadFile(packageJsonPath);
    if (packageJson.stripes && packageJson.stripes.translations) {
      for (const language of Object.keys(packageJson.stripes.translations)) {
        // When filter is set, skip other languages. Otherwise loads all
        if (!this.languageFilter.length || this.languageFilter.includes(language)) {
          moduleTranslations[language] = StripesTranslationPlugin.prefixModuleKeys(moduleName, packageJson.stripes.translations[language]);
        }
      }
    }
    return moduleTranslations;
  }

  // Common point for loading and parsing the file facilitates testing
  static loadFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Could also use require here...
    // return require(filePath); // eslint-disable-line global-require, import/no-dynamic-require
  }

  // Converts "example.key" for "@folio/app" into "ui-app.example.key"
  static prefixModuleKeys(moduleName, translations) {
    const name = moduleName.replace(/.*\//, '');
    const prefix = name.indexOf('stripes-') === 0 ? `${name}.` : `ui-${name}.`;
    return prefixKeys(translations, prefix);
  }

  // Assign output path names for each to be accessed later by stripes-config-plugin
  generateFileNames(allTranslations) {
    const files = {};
    const timestamp = Date.now(); // To facilitate cache busting, could also generate a hash
    Object.keys(allTranslations).forEach((language) => {
      files[language] = {
        // Fetching from the browser must take into account public path. The replace regex removes double slashes
        browserPath: `${this.publicPath}/translations/${language}-${timestamp}.json`.replace(/\/\//, '/'),
        emitPath: `translations/${language}-${timestamp}.json`,
      };
    });
    return files;
  }
};
