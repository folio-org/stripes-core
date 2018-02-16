const expect = require('chai').expect;
const modulePaths = require('../../webpack/module-paths');
const { StripesModuleParser, parseAllModules } = require('../../webpack/stripes-module-parser');

const moduleName = '@folio/users';
const moduleConfig = {};
const context = '/path/to/folio-testing-platform';
const aliases = {
  react: '/path/to/node_modules/react',
};
const enabledModules = {
  '@folio/users': {},
  '@folio/search': {},
  '@folio/developer': {},
};

function mockPackageJson(mod) {
  return {
    name: mod,
    description: `description for ${mod}`,
    version: '1.0.0',
    stripes: {
      type: 'app',
      displayName: `display name for ${mod}`,
      route: `/${mod}`,
      permissionSets: [],
    },
  };
}

describe('The stripes-module-parser', function () {
  describe('loadPackageJson method', function () {
    it('throws StripesBuildError when package.json is missing', function () {
      this.sandbox.stub(modulePaths, 'locateStripesModule').returns(false);
      try {
        this.sut = new StripesModuleParser(moduleName, moduleConfig, context, aliases);
        expect('never to be called').to.equal(true);
      } catch (err) {
        expect(err.message).to.match(/Unable to locate/);
      }
    });
  });

  describe('parseStripesConfig method', function () {
    beforeEach(function () {
      this.packageJson = mockPackageJson('@folio/users');
      this.sandbox.stub(StripesModuleParser.prototype, 'loadModulePackageJson').callsFake(mockPackageJson);
      this.sut = new StripesModuleParser(moduleName, moduleConfig, context, aliases);
    });

    it('throws StripesBuildError when stripes is missing', function () {
      delete this.packageJson.stripes;
      try {
        this.sut.parseStripesConfig('@folio/users', this.packageJson);
        expect('never to be called').to.equal(true);
      } catch (err) {
        expect(err.message).to.match(/does not have a "stripes" key/);
      }
    });

    it('throws StripesBuildError when stripes.type is missing', function () {
      delete this.packageJson.stripes.type;
      try {
        this.sut.parseStripesConfig('@folio/users', this.packageJson);
        expect('never to be called').to.equal(true);
      } catch (err) {
        expect(err.message).to.match(/does not specify stripes\.type/);
      }
    });

    it('returns a parsed config', function () {
      const result = this.sut.parseStripesConfig('@folio/users', this.packageJson);
      expect(result).to.be.an('object').with.all.keys(
        'module', 'getModule', 'description', 'version', 'displayName', 'route', 'permissionSets',
      );
    });

    it('applies overrides from tenant config', function () {
      this.sut.overrideConfig = { displayName: 'something else' };
      const result = this.sut.parseStripesConfig('@folio/users', this.packageJson);
      expect(result.displayName).to.equal('something else');
    });

    it('assigns getModule function', function () {
      const result = this.sut.parseStripesConfig('@folio/users', this.packageJson);
      expect(result.getModule).to.be.a('function');
    });
  });
});

describe('parseAllModules function', function () {
  beforeEach(function () {
    this.sandbox.stub(StripesModuleParser.prototype, 'loadModulePackageJson').callsFake(mockPackageJson);
    this.sut = parseAllModules;
  });

  it('returns config and metadata collections', function () {
    const result = this.sut(enabledModules, context, aliases);
    expect(result).to.be.an('object').with.all.keys('config', 'metadata');
  });

  it('returns config grouped by stripes type', function () {
    const result = this.sut(enabledModules, context, aliases);
    expect(result.config).to.be.an('object').with.property('app').that.is.an('array');
    expect(result.config.app[0]).to.be.an('object').with.all.keys(
      'module', 'getModule', 'description', 'version', 'displayName', 'route', 'permissionSets',
    );
  });

  it('returns metadata for each module', function () {
    const result = this.sut(enabledModules, context, aliases);
    expect(result.metadata).to.be.an('object').with.all.keys('users', 'search', 'developer');
  });
});
