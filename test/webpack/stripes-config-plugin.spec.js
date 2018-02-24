const expect = require('chai').expect;

const VirtualModulesPlugin = require('webpack-virtual-modules');
const StripesConfigPlugin = require('../../webpack/stripes-config-plugin');
const StripesTranslationsPlugin = require('../../webpack/stripes-translations-plugin');
const StripesBrandingPlugin = require('../../webpack/stripes-branding-plugin');
const stripesModuleParser = require('../../webpack/stripes-module-parser');
const stripesSerialize = require('../../webpack/stripes-serialize');

const compilerStub = {
  apply: () => {},
  plugin: () => {},
  options: {
    resolve: {
      alias: {
        'my-alias': '/path/to/some-module',
      },
    },
    plugins: [],
  },
  context: '/context/path',
  warnings: [],
};

const mockConfig = {
  modules: {
    '@folio/users': {},
    '@folio/search': {},
    '@folio/developer': {},
  },
};

describe('The stripes-config-plugin', function () {
  describe('constructor', function () {
    it('throws StripesBuildError when missing modules config', function () {
      const config = {};
      try {
        const sut = new StripesConfigPlugin(config); // eslint-disable-line no-unused-vars
        expect('should not get here').to.equal(false);
      } catch (err) {
        expect(err.message).match(/was not provided a "modules" object/);
      }
    });

    it('omits branding config (handled by its own plugin)', function () {
      const config = {
        modules: {},
        branding: {},
      };
      const sut = new StripesConfigPlugin(config);
      expect(sut.options).to.have.property('modules');
      expect(sut.options).to.not.have.property('branding');
    });
  });

  describe('apply method', function () {
    beforeEach(function () {
      this.sandbox.stub(stripesModuleParser, 'parseAllModules').returns({ app: ['something'] });
      this.sut = new StripesConfigPlugin(mockConfig);
    });

    it('applies a virtual module', function () {
      this.sandbox.spy(compilerStub, 'apply');
      this.sut.apply(compilerStub);

      expect(compilerStub.apply).to.have.been.calledOnce;
      const applyCall = compilerStub.apply.getCall(0);
      expect(applyCall.args[0]).to.be.an.instanceOf(VirtualModulesPlugin);
    });

    it('registers the "after-plugins" hook', function () {
      this.sandbox.spy(compilerStub, 'plugin');
      this.sut.apply(compilerStub);
      expect(compilerStub.plugin).to.have.been.calledWith('after-plugins');
    });
  });

  describe('afterPlugins method', function () {
    beforeEach(function () {
      this.sandbox.stub(stripesModuleParser, 'parseAllModules').returns({ config: 'something', metadata: 'something' });
      this.sandbox.stub(VirtualModulesPlugin.prototype, 'writeModule').returns({});
      this.sandbox.stub(stripesSerialize, 'serializeWithRequire').returns({});
      this.sut = new StripesConfigPlugin(mockConfig);

      compilerStub.plugins = [];

      const translationPlugin = new StripesTranslationsPlugin({ config: {} });
      translationPlugin.allFiles = { en: '/translations/en.json' };
      compilerStub.options.plugins.push(translationPlugin);

      const brandingPlugin = new StripesBrandingPlugin({});
      brandingPlugin.serializedBranding = JSON.stringify({ logo: { alt: 'Future Of Libraries Is Open' } });
      compilerStub.options.plugins.push(brandingPlugin);

      this.sut.apply(compilerStub);
    });

    it('calls virtualModule.writeModule()', function () {
      this.sut.afterPlugins(compilerStub);
      expect(this.sut.virtualModule.writeModule).to.have.been.calledOnce;
    });

    it('writes serialized config to virtual module', function () {
      this.sut.afterPlugins(compilerStub);
      const writeModuleArgs = this.sut.virtualModule.writeModule.getCall(0).args;
      expect(writeModuleArgs[0]).to.be.a('string').that.equals('node_modules/stripes-config.js');

      // TODO: More thorough analysis of the generated virtual module
      expect(writeModuleArgs[1]).to.be.a('string').with.match(/export { okapi, config, modules, branding, translations, metadata }/);
    });
  });

  describe('processWarnings method', function () {
    beforeEach(function () {
      compilerStub.warnings = [];
      this.sut = new StripesConfigPlugin(mockConfig);
    });

    it('assigns warnings to the Webpack compilation', function () {
      this.sut.warnings = ['uh-oh', 'something happened'];
      this.sut.processWarnings(compilerStub, () => {});
      expect(compilerStub.warnings).to.be.an('array').with.length(1);
      expect(compilerStub.warnings[0]).to.match(/uh-oh/);
      expect(compilerStub.warnings[0]).to.match(/something happened/);
    });

    it('does not assign warnings when not present', function () {
      this.sut.warnings = [];
      this.sut.processWarnings(compilerStub, () => {});
      expect(compilerStub.warnings).to.be.an('array').with.length(0);
    });
  });
});
