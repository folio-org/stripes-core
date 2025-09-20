import { getConfigService, createConfigService, resetConfigService } from './configService';

// Mock stripes-config
jest.mock('stripes-config', () => ({
  config: {
    tenantOptions: {
      diku: { name: 'diku', clientId: 'diku-app', displayName: 'Diku University' },
      test: { name: 'test', clientId: 'test-app', displayName: 'Test Tenant' }
    },
    disableAuth: false,
    hasAllPerms: false
  },
  okapi: {
    url: 'https://folio-testing-okapi.dev.folio.org',
    tenant: 'diku'
  }
}));

describe('ConfigService', () => {
  beforeEach(() => {
    resetConfigService();
  });

  afterEach(() => {
    resetConfigService();
  });

  describe('getConfigService', () => {
    it('should return a singleton instance', () => {
      const service1 = getConfigService();
      const service2 = getConfigService();
      
      expect(service1).toBe(service2);
    });
  });

  describe('createConfigService', () => {
    it('should create a new instance each time', () => {
      const service1 = createConfigService();
      const service2 = createConfigService();
      
      expect(service1).not.toBe(service2);
    });
  });

  describe('config operations', () => {
    let configService;

    beforeEach(() => {
      configService = createConfigService();
    });

    it('should get config asynchronously', async () => {
      const config = await configService.getConfig();
      
      expect(config).toEqual(expect.objectContaining({
        tenantOptions: {
          diku: { name: 'diku', clientId: 'diku-app', displayName: 'Diku University' },
          test: { name: 'test', clientId: 'test-app', displayName: 'Test Tenant' }
        },
        disableAuth: false,
        hasAllPerms: false,
        _loadedAsync: true,
        _loadedAt: expect.any(String)
      }));
    });

    it('should get tenant options', async () => {
      const tenantOptions = await configService.getTenantOptions();
      
      expect(tenantOptions).toEqual({
        diku: { name: 'diku', clientId: 'diku-app', displayName: 'Diku University' },
        test: { name: 'test', clientId: 'test-app', displayName: 'Test Tenant' }
      });
    });

    it('should get okapi config', async () => {
      const okapiConfig = await configService.getOkapiConfig();
      
      expect(okapiConfig).toEqual(expect.objectContaining({
        url: 'https://folio-testing-okapi.dev.folio.org',
        tenant: 'diku',
        _loadedAsync: true,
        _loadedAt: expect.any(String)
      }));
    });

    it('should get all config', async () => {
      const allConfig = await configService.getAllConfig();
      
      expect(allConfig).toEqual(expect.objectContaining({
        config: expect.objectContaining({
          tenantOptions: expect.any(Object),
          _loadedAsync: true
        }),
        okapi: expect.objectContaining({
          url: expect.any(String),
          _loadedAsync: true
        }),
        _loadedAsync: true,
        _loadedAt: expect.any(String)
      }));
    });

    it('should check if tenant option exists', async () => {
      const hasDiku = await configService.hasTenantOption('diku');
      const hasNonexistent = await configService.hasTenantOption('nonexistent');
      
      expect(hasDiku).toBe(true);
      expect(hasNonexistent).toBe(false);
    });

    it('should get specific tenant config', async () => {
      const dikuConfig = await configService.getTenantConfig('diku');
      const nonexistentConfig = await configService.getTenantConfig('nonexistent');
      
      expect(dikuConfig).toEqual({
        name: 'diku',
        clientId: 'diku-app',
        displayName: 'Diku University'
      });
      expect(nonexistentConfig).toBe(null);
    });

    it('should cache config promise', async () => {
      const config1 = await configService.getConfig();
      const config2 = await configService.getConfig();
      
      // Should return the same object reference due to caching
      expect(config1).toBe(config2);
    });
  });

  describe('error handling', () => {
    it('should handle missing tenant options gracefully', async () => {
      // Mock config without tenantOptions
      jest.doMock('stripes-config', () => ({
        config: {},
        okapi: { url: 'test', tenant: 'test' }
      }));

      const configService = createConfigService();
      const tenantOptions = await configService.getTenantOptions();
      
      expect(tenantOptions).toEqual({});
    });
  });
});