const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');
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
    Object.assign(this.modules, options.modules);
    this.languageFilter = options.config.languages || [];
  }

  apply(compiler) {
    // Used to help locate modules
    this.context = compiler.context;
    this.publicPath = compiler.options.output.publicPath;
    this.aliases = compiler.options.resolve.alias;

    // Limit the number of languages processed during build
    if (this.languageFilter.length) {
      const filterRegex = new RegExp(`(${this.languageFilter.join('|')})`);
      compiler.apply(new webpack.ContextReplacementPlugin(/react-intl[/\\]locale-data/, filterRegex));
      compiler.apply(new webpack.ContextReplacementPlugin(/moment[/\\]locale/, filterRegex));
    }

    // Gather all translations available in each module
    const allTranslations = this.gatherAllTranslations();
    const fileData = this.generateFileNames(allTranslations);
    this.allFiles = _.mapValues(fileData, data => data.browserPath);

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
      const modPackageJsonPath = locateStripesModule(this.context, mod, this.aliases, 'package.json');
      const modTranslationDir = modPackageJsonPath.replace('package.json', 'translations');

      if (fs.existsSync(modTranslationDir)) {
        _.merge(allTranslations, this.loadTranslationsDirectory(mod, modTranslationDir));
      } else {
        _.merge(allTranslations, this.loadTranslationsPackageJson(mod, modPackageJsonPath));
      }
    }
    return allTranslations;
  }

  loadTranslationsDirectory(moduleName, dir) {
    const moduleTranslations = {};
    for (const translationFile of fs.readdirSync(dir)) {
      const language = translationFile.replace('.json', '');
      if (!this.languageFilter.length || this.languageFilter.includes(language)) {
        const translations = require(path.join(dir, translationFile)); // eslint-disable-line global-require, import/no-dynamic-require, because we're building something here
        moduleTranslations[language] = StripesTranslationPlugin.prefixModuleKeys(moduleName, translations);
      }
    }
    return moduleTranslations;
  }

  // Maintains backwards-compatibility with existing apps
  loadTranslationsPackageJson(moduleName, packageJsonPath) {
    const moduleTranslations = {};
    const packageJson = require(packageJsonPath); // eslint-disable-line global-require, import/no-dynamic-require, because we're building something here
    if (packageJson.stripes && packageJson.stripes.translations) {
      for (const language of Object.keys(packageJson.stripes.translations)) {
        if (!this.languageFilter.length || this.languageFilter.includes(language)) {
          moduleTranslations[language] = StripesTranslationPlugin.prefixModuleKeys(moduleName, packageJson.stripes.translations[language]);
        }
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
