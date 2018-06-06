const expect = require('chai').expect;

const StripesWebpackPlugin = require('../../webpack/stripes-webpack-plugin');
const StripesConfigPlugin = require('../../webpack/stripes-config-plugin');
const StripesTranslationsPlugin = require('../../webpack/stripes-translations-plugin');
const StripesBrandingPlugin = require('../../webpack/stripes-branding-plugin');
const StripesDuplicatesPlugin = require('../../webpack/stripes-duplicate-plugin');

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
  hooks: {
    afterPlugins: {
      tap: () => {},
    },
    emit: {
      tapAsync: () => {},
    }
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
  config: {},
};

describe('The stripes-webpack-plugin', function () {
  describe('apply method', function () {
    beforeEach(function () {
      this.sandbox.stub(StripesConfigPlugin.prototype, 'apply').callsFake(() => {});
      this.sandbox.stub(StripesBrandingPlugin.prototype, 'apply').callsFake(() => {});
      this.sandbox.stub(StripesTranslationsPlugin.prototype, 'apply').callsFake(() => {});
      this.sandbox.stub(StripesDuplicatesPlugin.prototype, 'apply').callsFake(() => {});
      this.sut = new StripesWebpackPlugin({ stripesConfig: mockConfig });
    });

    afterEach(function () {
      delete compilerStub.hooks.stripesConfigPluginBeforeWrite;
    });

    it('applies StripesConfigPlugin', function () {
      this.sut.apply(compilerStub);
      expect(StripesConfigPlugin.prototype.apply).to.have.been.calledOnce;
      expect(StripesConfigPlugin.prototype.apply).to.be.calledWith(compilerStub);
    });

    it('applies StripesBrandingPlugin', function () {
      this.sut.apply(compilerStub);
      expect(StripesBrandingPlugin.prototype.apply).to.have.been.calledOnce;
      expect(StripesBrandingPlugin.prototype.apply).to.be.calledWith(compilerStub);
    });

    it('applies StripesTranslationsPlugin', function () {
      this.sut.apply(compilerStub);
      expect(StripesTranslationsPlugin.prototype.apply).to.have.been.calledOnce;
      expect(StripesTranslationsPlugin.prototype.apply).to.be.calledWith(compilerStub);
    });

    it('applies StripesDuplicatesPlugin', function () {
      this.sut.apply(compilerStub);
      expect(StripesDuplicatesPlugin.prototype.apply).to.have.been.calledOnce;
      expect(StripesDuplicatesPlugin.prototype.apply).to.be.calledWith(compilerStub);
    });
  });
});
