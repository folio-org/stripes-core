const expect = require('chai').expect;

const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const defaultBranding = require('../../default-assets/branding');
const StripesBrandingPlugin = require('../../webpack/stripes-branding-plugin');

// Sample data for test
const tenantBranding = {
  logo: {
    src: './path/to/my-logo.png',
    alt: 'my alt',
  },
  favicon: {
    src: './path/to/my-favicon.ico',
  },
};

// Stub the parts of the webpack compiler that the StripesBrandingPlugin interacts with
const compilerStub = {
  apply: () => {},
  plugin: () => {},
  options: {
    plugins: ['something', {}, new HtmlWebpackPlugin()], // sample plugin data
  },
};

describe('The stripes-branding-plugin', function () {
  describe('constructor', function () {
    it('uses default branding', function () {
      const sut = new StripesBrandingPlugin();
      expect(sut.branding).to.be.an('object').with.property('logo');
      expect(sut.branding).to.deep.include(defaultBranding);
    });

    it('accepts tenant branding', function () {
      const sut = new StripesBrandingPlugin(tenantBranding);
      expect(sut.branding).to.be.an('object').with.property('logo');
      expect(sut.branding).to.deep.include(tenantBranding);
    });
  });

  describe('apply method', function () {
    it('applies the FaviconsWebpackPlugin', function () {
      this.sandbox.spy(compilerStub, 'apply');
      const sut = new StripesBrandingPlugin();
      sut.apply(compilerStub);

      expect(compilerStub.apply).to.have.been.calledOnce;
      const applyCall = compilerStub.apply.getCall(0);
      expect(applyCall.args[0]).to.be.an.instanceOf(FaviconsWebpackPlugin);
    });
  });

  describe('_initFavicon method', function () {
    it('returns an absolute file path without @folio/stripes-core for default favicon', function () {
      const result = StripesBrandingPlugin._initFavicon(defaultBranding.favicon.src);
      expect(result).to.be.a('string').that.does.not.include('@folio/stripes-core');
      expect(result.substr(0, 1)).to.equal('/');
    });
    it('returns an absolute file path for tenant favicon', function () {
      const result = StripesBrandingPlugin._initFavicon(tenantBranding.favicon.src);
      expect(result).to.include(tenantBranding.favicon.src.replace('.', ''));
      expect(result.substr(0, 1)).to.equal('/');
    });
  });
});
