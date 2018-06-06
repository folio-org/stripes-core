const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
const modulePaths = require('./module-paths');
const logger = require('./logger')('stripesTranslationsPlugin');

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
      '@folio/stripes-form': {},
    };
    Object.assign(this.modules, options.modules);
    this.languageFilter = options.config.languages || [];
    logger.log('language filter', this.languageFilter);
  }

  apply(compiler) {
    // Used to help locate modules
    this.context = compiler.context;
    this.publicPath = compiler.options.output.publicPath;
    this.aliases = compiler.options.resolve.alias;

    // Limit the number of languages loaded by third-party libraries with the ContextReplacementPlugin
    if (this.languageFilter.length) {
      const filterRegex = new RegExp(`(${this.languageFilter.join('|')})`); // constructed regex will look something like /(en|es)/
      new webpack.ContextReplacementPlugin(/react-intl[/\\]locale-data/, filterRegex).apply(compiler);
      new webpack.ContextReplacementPlugin(/moment[/\\]locale/, filterRegex).apply(compiler);
    }

    // Gather all translations available in each module
    const allTranslations = this.gatherAllTranslations();
    const fileData = this.generateFileNames(allTranslations);
    const allFiles = _.mapValues(fileData, data => data.browserPath);

    // Hook into stripesConfigPlugin to supply paths to translation files
    compiler.hooks.stripesConfigPluginBeforeWrite.tap('StripesTranslationsPlugin', (config) => {
      config.translations = allFiles;
      logger.log('stripesConfigPluginBeforeWrite', config.translations);
    });

    // Emit merged translations to the output directory
    compiler.hooks.emit.tapAsync('StripesTranslationsPlugin', (compilation, callback) => {
      Object.keys(allTranslations).forEach((language) => {
        logger.log(`emitting translations for ${language} --> ${fileData[language].emitPath}`);
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
        const moduleName = StripesTranslationPlugin.getModuleName(mod);
        const modTranslationDir = modPackageJsonPath.replace('package.json', `translations/${moduleName}`);
        if (fs.existsSync(modTranslationDir)) {
          _.merge(allTranslations, this.loadTranslationsDirectory(mod, modTranslationDir));
        } else {
          const modTranslationDirFallback = modPackageJsonPath.replace('package.json', 'translations');
          if (fs.existsSync(modTranslationDirFallback)) {
            logger.log(`cannot find ${modTranslationDir} falling back to ${modTranslationDirFallback}`);
            _.merge(allTranslations, this.loadTranslationsDirectory(mod, modTranslationDirFallback));
          } else {
            logger.log(`cannot find ${modTranslationDirFallback} falling back to ${modPackageJsonPath}`);
            _.merge(allTranslations, this.loadTranslationsPackageJson(mod, modPackageJsonPath));
          }
        }
      } else {
        console.log(`Unable to locate ${mod} while looking for translations.`);
      }
    }
    return allTranslations;
  }

  // Load translation *.json files from a single module's translation directory
  loadTranslationsDirectory(moduleName, dir) {
    logger.log('loading translations from directory', dir);
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
    logger.log('loading translations from package.json (legacy)', packageJsonPath);
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

  static getModuleName(module) {
    const name = module.replace(/.*\//, '');
    const moduleName = name.indexOf('stripes-') === 0 ? `${name}` : `ui-${name}`;
    return moduleName;
  }

  // Converts "example.key" for "@folio/app" into "ui-app.example.key"
  static prefixModuleKeys(moduleName, translations) {
    const prefix = `${StripesTranslationPlugin.getModuleName(moduleName)}.`;
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
