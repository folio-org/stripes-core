const expect = require('chai').expect;
const fs = require('fs');
const webpack = require('webpack');

const modulePaths = require('../../webpack/module-paths');
const StripesTranslationsPlugin = require('../../webpack/stripes-translations-plugin');

// Stub the parts of the webpack compiler that the StripesTranslationsPlugin interacts with
const compilerStub = {
  apply: () => {},
  plugin: () => {},
  options: {
    output: {
      publicPath: '/',
    },
    resolve: {
      aliases: {},
    },
  },
};

describe('The stripes-translations-plugin', function () {
  beforeEach(function () {
    this.stripesConfig = {
      config: {},
      modules: {
        '@folio/users': {},
        '@folio/inventory': {},
        '@folio/items': {},
        '@folio/checkout': {},
      },
    };
  });

  describe('constructor', function () {
    it('includes stripes-core with modules for translation', function () {
      const sut = new StripesTranslationsPlugin(this.stripesConfig);
      expect(sut.modules).to.be.an('object').with.property('@folio/stripes-core');
      expect(sut.modules).to.deep.include(this.stripesConfig.modules);
    });

    it('assigns language filter', function () {
      this.stripesConfig.config.languages = ['en'];
      const sut = new StripesTranslationsPlugin(this.stripesConfig);
      expect(sut.languageFilter).to.be.an('array').and.include('en');
    });
  });

  describe('apply method', function () {
    beforeEach(function () {
      this.sandbox.stub(modulePaths, 'locateStripesModule').callsFake((context, mod) => `path/to/${mod}/package.json`);
      this.sandbox.stub(fs, 'existsSync').returns(true);
      this.sandbox.stub(fs, 'readdirSync').returns(['en.json', 'es.json', 'fr.json']);
      this.sandbox.spy(compilerStub, 'apply');
      this.sandbox.spy(compilerStub, 'plugin');
      this.sandbox.stub(StripesTranslationsPlugin, 'loadFile').returns({ key1: 'Value 1', key2: 'Value 2' });
      this.compilationStub = {
        assets: {},
      };
    });

    it('registers the "emit" hook', function () {
      this.sut = new StripesTranslationsPlugin(this.stripesConfig);
      this.sut.apply(compilerStub);
      expect(compilerStub.plugin).to.be.calledWith('emit');
    });

    it('generates an emit function with all translations', function () {
      this.sut = new StripesTranslationsPlugin(this.stripesConfig);
      this.sut.apply(compilerStub);

      // Get the function passed to 'emit' hook
      const pluginArgs = compilerStub.plugin.getCall(0).args;
      const emitFunction = pluginArgs[1];

      // Call it and observe the modification to compilation.assets
      emitFunction(this.compilationStub, () => {});
      const emitFiles = Object.keys(this.compilationStub.assets);

      expect(emitFiles).to.have.length(3);
      expect(emitFiles).to.match(/translations\/en-\d+\.json/);
      expect(emitFiles).to.match(/translations\/es-\d+\.json/);
      expect(emitFiles).to.match(/translations\/fr-\d+\.json/);
    });

    it('applies ContextReplacementPlugins when language filters are set', function () {
      this.sut = new StripesTranslationsPlugin(this.stripesConfig);
      this.sut.languageFilter = ['en'];
      this.sut.apply(compilerStub);

      expect(compilerStub.apply).to.be.calledTwice;
      const applyArgs = compilerStub.apply.getCall(0).args;
      expect(applyArgs[0]).to.be.instanceOf(webpack.ContextReplacementPlugin);
    });
  });

  describe('gatherAllTranslations method', function () {
    beforeEach(function () {
      this.sandbox.stub(modulePaths, 'locateStripesModule').callsFake((context, mod) => `path/to/${mod}/package.json`);
      this.sut = new StripesTranslationsPlugin(this.stripesConfig);
      this.sandbox.stub(this.sut, 'loadTranslationsDirectory').returns({});
      this.sandbox.stub(this.sut, 'loadTranslationsPackageJson').returns({});
    });

    it('uses the translation directory when it exists', function () {
      this.sandbox.stub(fs, 'existsSync').returns(true); // translation dir exists
      this.sut.gatherAllTranslations();
      expect(this.sut.loadTranslationsDirectory).to.have.been.called;
      expect(this.sut.loadTranslationsPackageJson).not.to.have.been.called;
    });

    it('uses package.json when translations directory does not exist', function () {
      this.sandbox.stub(fs, 'existsSync').returns(false); // translation dir does not exist
      this.sut.gatherAllTranslations();
      expect(this.sut.loadTranslationsDirectory).not.to.have.been.called;
      expect(this.sut.loadTranslationsPackageJson).to.have.been.called;
    });
  });

  describe('loadTranslationsDirectory method', function () {
    beforeEach(function () {
      this.sandbox.stub(fs, 'readdirSync').returns(['en.json', 'es.json', 'fr.json']);
      this.sandbox.stub(StripesTranslationsPlugin, 'loadFile').returns({ key1: 'Value 1', key2: 'Value 2' });
      this.sut = new StripesTranslationsPlugin(this.stripesConfig);
    });

    it('loads all translations from the translation directory', function () {
      const result = this.sut.loadTranslationsDirectory('@folio/my-app', 'path/to/translations');
      expect(StripesTranslationsPlugin.loadFile).to.have.callCount(3);
      expect(result).to.be.an('object').with.all.keys('en', 'fr', 'es');
    });

    it('loads only filtered translations from the translation directory', function () {
      this.sut.languageFilter = ['en'];
      const result = this.sut.loadTranslationsDirectory('@folio/my-app', 'path/to/translations');
      expect(StripesTranslationsPlugin.loadFile).to.have.been.calledOnce;
      expect(result).to.be.an('object').with.all.keys('en').and.not.any.keys('fr', 'es');
    });
  });

  describe('loadTranslationsPackageJson method', function () {
    beforeEach(function () {
      this.sandbox.stub(StripesTranslationsPlugin, 'loadFile').returns({
        stripes: {
          translations: {
            en: { key1: 'Value 1', key2: 'Value 2' },
            es: { key1: 'Value 1', key2: 'Value 2' },
            fr: { key1: 'Value 1', key2: 'Value 2' },
          },
        },
      });
      this.sut = new StripesTranslationsPlugin(this.stripesConfig);
    });

    it('loads all translations from package.json', function () {
      const result = this.sut.loadTranslationsPackageJson('@folio/my-app', 'path/to/package.json');
      expect(result).to.be.an('object').with.all.keys('en', 'fr', 'es');
    });

    it('loads only filtered translations from package.json', function () {
      this.sut.languageFilter = ['en'];
      const result = this.sut.loadTranslationsPackageJson('@folio/my-app', 'path/to/translations');
      expect(result).to.be.an('object').with.all.keys('en').and.not.any.keys('fr', 'es');
    });
  });

  describe('prefixModuleKeys method', function () {
    it('applies "ui-" prefix to module keys', function () {
      const translations = { key1: 'Value 1', key2: 'Value 2', key3: 'Value 3' };
      const result = StripesTranslationsPlugin.prefixModuleKeys('@folio/my-app', translations);
      expect(result).to.be.an('object').with.all.keys('ui-my-app.key1', 'ui-my-app.key2', 'ui-my-app.key3');
    });

    it('does not apply "ui-" prefix to stripes-core keys', function () {
      const translations = { key1: 'Value 1', key2: 'Value 2', key3: 'Value 3' };
      const result = StripesTranslationsPlugin.prefixModuleKeys('@folio/stripes-core', translations);
      expect(result).to.be.an('object').with.all.keys('stripes-core.key1', 'stripes-core.key2', 'stripes-core.key3');
    });
  });

  describe('generateFileNames method', function () {
    beforeEach(function () {
      this.sut = new StripesTranslationsPlugin(this.stripesConfig);
    });

    it('returns paths for emit hook and browser fetch', function () {
      const translations = {
        en: { key1: 'Value 1', key2: 'Value 2' },
      };
      this.sut.publicPath = '/';
      const result = this.sut.generateFileNames(translations);
      expect(result).to.be.an('object').with.property('en').with.property('browserPath').match(/^\/translations\/en-\d+\.json/);
      expect(result).to.be.an('object').with.property('en').with.property('emitPath').match(/^translations\/en-\d+\.json/);
    });

    it('applies publicPath', function () {
      const translations = {
        en: { key1: 'Value 1', key2: 'Value 2' },
      };
      this.sut.publicPath = '/my-public-path/';
      const result = this.sut.generateFileNames(translations);
      expect(result).to.be.an('object').with.property('en').with.property('browserPath').match(/^\/my-public-path\/translations\/en-\d+\.json/);
      expect(result).to.be.an('object').with.property('en').with.property('emitPath').match(/^translations\/en-\d+\.json/);
    });
  });
});
