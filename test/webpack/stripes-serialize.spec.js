const expect = require('chai').expect;

const defaultBranding = require('../../default-assets/branding');
const { serializeWithRequire } = require('../../webpack/stripes-serialize');

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

describe('The stripes-serialize module', function () {
  describe('serializeWithRequire function', function () {
    it('maintains absolute src paths', function () {
      const result = serializeWithRequire(defaultBranding);
      expect(result).to.be.a('string')
        .which.includes(`'${defaultBranding.logo.src}'`);
    });

    it('updates custom src paths', function () {
      const result = serializeWithRequire(tenantBranding);
      expect(result).to.be.a('string')
        .which.includes(`'.${tenantBranding.logo.src}'`)
        .and.not.include(`'${tenantBranding.logo.src}'`);
    });

    it('wraps src values in require()', function () {
      const result = serializeWithRequire(tenantBranding);
      expect(result).to.include('"src": require(');
    });

    it('does not wrap non-src values in require()', function () {
      const result = serializeWithRequire(tenantBranding);
      expect(result).to.not.include('"alt": require(');
    });
  });
});
