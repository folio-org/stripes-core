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
const icons = [
  { name: 'one',
    alt: 'alt for one',
    fileName: 'oneFile',
    title: 'a title for one' },
  { name: 'two',
    alt: 'alt for two',
    fileName: 'twoFile',
    title: 'a title for two' },
];
const welcomePageEntries = [
  { iconName: 'one',
    headline: 'welcome headline',
    description: 'welcome description' },
  { iconName: 'two',
    headline: 'another welcome headline',
    description: 'another welcome description' },
];

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
      icons,
      welcomePageEntries,
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

  describe('parsing methods', function () {
    beforeEach(function () {
      this.packageJson = mockPackageJson('@folio/users');
      this.sandbox.stub(StripesModuleParser.prototype, 'loadModulePackageJson').callsFake(mockPackageJson);
      this.sandbox.stub(modulePaths, 'tryResolve').returns(true); // Mocks finding all the icon files
      this.sut = new StripesModuleParser(moduleName, moduleConfig, context, aliases);
      this.sut.modulePath = '/path/to/module';
    });

    describe('parseStripesConfig', function () {
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
        expect(result).to.be.an('object').with.keys(
          'module', 'getModule', 'description', 'version', 'displayName', 'route', 'permissionSets', 'icons', 'welcomePageEntries',
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

    describe('parseStripesMetadata', function () {
      it('returns metadata', function () {
        const result = this.sut.parseStripesMetadata(this.packageJson);
        expect(result).to.be.an('object').with.keys(
          'name', 'version', 'description', 'license', 'feedback', 'type', 'shortTitle', 'fullTitle',
          'defaultPopoverSize', 'defaultPreviewWidth', 'helpPage', 'icons', 'welcomePageEntries',
        );
      });
    });

    describe('getIconMetadata', function () {
      it('returns icon data by name', function () {
        const result = this.sut.getIconMetadata(icons);
        expect(result).to.be.an('object').with.all.keys('one', 'two');
        expect(result.one).to.include({
          alt: 'alt for one',
          title: 'a title for one',
        });
      });

      it('warns when icons are missing', function () {
        this.sut.getIconMetadata(undefined, true);
        expect(this.sut.warnings[0]).to.match(/no icons defined/);
      });

      it('uses icon.fileName for building file paths', function () {
        const result = this.sut.getIconMetadata(icons);
        expect(result.one).to.include({
          src: '/path/to/module/icons/oneFile.svg',
        });
      });

      it('falls back to icon.name when icon.fileName is not specified', function () {
        const iconsNoFileName = [
          { name: 'one',
            alt: 'alt for one',
            title: 'a title for one' },
        ];
        const result = this.sut.getIconMetadata(iconsNoFileName);
        expect(result.one).to.include({
          src: '/path/to/module/icons/one.svg',
        });
      });
    });

    describe('buildIconFilePaths', function () {
      it('returns all file variants (high/low)', function () {
        const result = this.sut.buildIconFilePaths('one');
        expect(result).to.deep.include({
          high: { src: '/path/to/module/icons/one.svg' },
          low: { src: '/path/to/module/icons/one.png' },
        });
      });

      it('returns default icon src', function () {
        const result = this.sut.buildIconFilePaths('one');
        expect(result).to.deep.include({
          src: '/path/to/module/icons/one.svg',
        });
      });

      it('does not return paths for missing icons', function () {
        modulePaths.tryResolve.restore();
        this.sandbox.stub(modulePaths, 'tryResolve').returns(false);
        const result = this.sut.buildIconFilePaths('one');
        expect(result).to.deep.include({
          high: { src: '' },
          low: { src: '' },
        });
      });

      it('warns for missing icons variants', function () {
        modulePaths.tryResolve.restore();
        this.sandbox.stub(modulePaths, 'tryResolve').returns(false);
        this.sut.buildIconFilePaths('one');
        expect(this.sut.warnings[0]).to.match(/missing file/);
      });
    });

    describe('getWelcomePageEntries', function () {
      it('returns array of welcomePageEntries', function () {
        const parsedIcons = this.sut.getIconMetadata(icons);
        const result = this.sut.getWelcomePageEntries(welcomePageEntries, parsedIcons);
        expect(result).to.be.an('array').with.length(2);
        expect(result[0]).to.deep.equal(welcomePageEntries[0]);
      });

      it('warns when a missing icon is referenced', function () {
        const parsedIcons = this.sut.getIconMetadata(icons);
        delete parsedIcons.one;
        this.sut.getWelcomePageEntries(welcomePageEntries, parsedIcons);
        expect(this.sut.warnings[0]).to.match(/no matching stripes.icons/);
      });
    });
  });
});

describe('parseAllModules function', function () {
  beforeEach(function () {
    this.sandbox.stub(StripesModuleParser.prototype, 'loadModulePackageJson').callsFake(mockPackageJson);
    this.sandbox.stub(modulePaths, 'tryResolve').returns(true); // Mocks finding all the icon files
    this.sut = parseAllModules;
  });

  it('returns config and metadata collections', function () {
    const result = this.sut(enabledModules, context, aliases);
    expect(result).to.be.an('object').with.all.keys('config', 'metadata', 'warnings');
  });

  it('returns config grouped by stripes type', function () {
    const result = this.sut(enabledModules, context, aliases);
    expect(result.config).to.be.an('object').with.property('app').that.is.an('array');
    expect(result.config.app[0]).to.be.an('object').with.keys(
      'module', 'getModule', 'description', 'version', 'displayName', 'route', 'permissionSets', 'icons', 'welcomePageEntries',
    );
  });

  it('returns metadata for each module', function () {
    const result = this.sut(enabledModules, context, aliases);
    expect(result.metadata).to.be.an('object').with.all.keys('users', 'search', 'developer');
    expect(result.warnings).to.be.an('array').with.lengthOf(0);
  });

  it('returns warnings for each module', function () {
    modulePaths.tryResolve.restore();
    this.sandbox.stub(modulePaths, 'tryResolve').returns(false); // Mock missing files
    const result = this.sut(enabledModules, context, aliases);
    expect(result.warnings).to.be.an('array').with.lengthOf.at.least(1);
  });
});
