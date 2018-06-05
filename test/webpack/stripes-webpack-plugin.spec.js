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
      this.sut = new StripesWebpackPlugin({ stripesConfig: mockConfig });
      this.sandbox.spy(compilerStub, 'apply');
    });

    afterEach(function () {
      delete compilerStub.hooks.stripesConfigPluginBeforeWrite;
    });

    it('applies StripesConfigPlugin', function () {
      this.sut.apply(compilerStub);
      const matchingCall = compilerStub.apply.getCalls().find(call => call.args[0] instanceof StripesConfigPlugin);
      expect(matchingCall).to.exist;
    });

    it('applies StripesBrandingPlugin', function () {
      this.sut.apply(compilerStub);
      const matchingCall = compilerStub.apply.getCalls().find(call => call.args[0] instanceof StripesBrandingPlugin);
      expect(matchingCall).to.exist;
    });

    it('applies StripesTranslationsPlugin', function () {
      this.sut.apply(compilerStub);
      const matchingCall = compilerStub.apply.getCalls().find(call => call.args[0] instanceof StripesTranslationsPlugin);
      expect(matchingCall).to.exist;
    });

    it('applies StripesDuplicatesPlugin', function () {
      this.sut.apply(compilerStub);
      const matchingCall = compilerStub.apply.getCalls().find(call => call.args[0] instanceof StripesDuplicatesPlugin);
      expect(matchingCall).to.exist;
    });
  });
});
