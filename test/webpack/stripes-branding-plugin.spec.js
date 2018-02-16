const expect = require('chai').expect;

const HtmlWebpackPlugin = require('html-webpack-plugin');
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
    it('assigns serialized branding to this.serializedBranding', function () {
      const sut = new StripesBrandingPlugin();
      sut.apply(compilerStub);
      expect(sut.serializedBranding).to.be.a('string')
        .which.includes(`"${defaultBranding.logo.alt}"`);
    });

    it('registers the "after-plugins" hook', function () {
      this.sandbox.spy(compilerStub, 'plugin');
      const sut = new StripesBrandingPlugin();
      sut.apply(compilerStub);
      expect(compilerStub.plugin).to.be.calledWith('after-plugins');
    });
  });

  describe('_serializeBranding method', function () {
    it('maintains absolute src paths', function () {
      const result = StripesBrandingPlugin._serializeBranding(defaultBranding);
      expect(result).to.be.a('string')
        .which.includes(`'${defaultBranding.logo.src}'`);
    });

    it('updates custom src paths', function () {
      const result = StripesBrandingPlugin._serializeBranding(tenantBranding);
      expect(result).to.be.a('string')
        .which.includes(`'.${tenantBranding.logo.src}'`)
        .and.not.include(`'${tenantBranding.logo.src}'`);
    });

    it('wraps src values in require()', function () {
      const result = StripesBrandingPlugin._serializeBranding(tenantBranding);
      expect(result).to.include('"src": require(');
    });

    it('does not wrap non-src values in require()', function () {
      const result = StripesBrandingPlugin._serializeBranding(tenantBranding);
      expect(result).to.not.include('"alt": require(');
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

  describe('_replaceFavicon method', function () {
    it('locates HtmlWebpackPlugin and updates favicon', function () {
      const sut = new StripesBrandingPlugin(tenantBranding);
      sut._replaceFavicon(compilerStub);

      const expected = tenantBranding.favicon.src.replace('.', '');
      expect(compilerStub.options.plugins[2].options.favicon).to.include(expected);
    });
  });
});
