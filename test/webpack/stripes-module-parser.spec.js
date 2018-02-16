const expect = require('chai').expect;
const modulePaths = require('../../webpack/module-paths');
const StripesModuleParser = require('../../webpack/stripes-module-parser');

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
  beforeEach(function () {
    const enabledModules = {
      '@folio/users': {},
      '@folio/search': {},
      '@folio/developer': {},
    };
    const context = '/path/to/folio-testing-platform';
    const aliases = {
      react: '/path/to/node_modules/react',
    };

    this.sut = new StripesModuleParser(enabledModules, context, aliases);
  });

  describe('loadPackageJson method', function () {
    it('throws StripesBuildError when package.json is missing', function () {
      this.sandbox.stub(modulePaths, 'locateStripesModule').returns(false);
      try {
        this.sut.loadModulePackageJson('test');
        expect('never to be called').to.equal(true);
      } catch (err) {
        expect(err.message).to.match(/Unable to locate/);
      }
    });
  });

  describe('parseStripesConfig method', function () {
    beforeEach(function () {
      this.packageJson = mockPackageJson('@folio/users');
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
      this.sut.enabledModules['@folio/users'] = { displayName: 'something else' };
      const result = this.sut.parseStripesConfig('@folio/users', this.packageJson);
      expect(result.displayName).to.equal('something else');
    });

    it('assigns getModule function', function () {
      const result = this.sut.parseStripesConfig('@folio/users', this.packageJson);
      expect(result.getModule).to.be.a('function');
    });
  });

  describe('parseAllModules method', function () {
    it('calls parseStripesConfig for each module', function () {
      this.sandbox.stub(this.sut, 'loadModulePackageJson').callsFake(mockPackageJson);
      this.sandbox.spy(this.sut, 'parseStripesConfig');
      this.sut.parseEnabledModules();
      expect(this.sut.parseStripesConfig).to.have.callCount(3);
    });

    it('returns config grouped by stripes type', function () {
      this.sandbox.stub(this.sut, 'loadModulePackageJson').callsFake(mockPackageJson);
      const result = this.sut.parseEnabledModules();
      expect(result.moduleConfigs).to.be.an('object').with.property('app').that.is.an('array');
      expect(result.moduleConfigs.app[0]).to.be.an('object').with.all.keys(
        'module', 'getModule', 'description', 'version', 'displayName', 'route', 'permissionSets',
      );
    });
  });
});
