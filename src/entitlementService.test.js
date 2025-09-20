/**
 * entitlementService.test.js
 * 
 * Tests for the entitlement service that provides Promise-based access
 * to entitlement data from stripes-config and API responses.
 */

// Mock stripes-config with default values
jest.mock('stripes-config', () => ({
  config: {
    tenantOptions: {
      diku: {
        name: 'diku',
        clientId: 'diku-application',
        displayName: 'Diku Library'
      },
      test: {
        name: 'test',
        clientId: 'test-application',
        displayName: 'Test Tenant'
      }
    },
    disableAuth: false,
    maxUnpagedResourceCount: 1000
  }
}));

/**
 * entitlementService.test.js
 * 
 * Tests for the entitlement service that provides Promise-based access
 * to entitlement data from stripes-config and API responses.
 */

// Simple mock for stripes-config
jest.mock('stripes-config', () => ({
  config: {
    tenantOptions: {
      diku: {
        name: 'diku',
        clientId: 'diku-application',
        displayName: 'Diku Library'
      },
      test: {
        name: 'test',
        clientId: 'test-application',
        displayName: 'Test Tenant'
      }
    },
    disableAuth: false,
    maxUnpagedResourceCount: 1000
  }
}));

import entitlementService, { getTenantOptions, getConfig, shouldUseEntitlementMode } from './entitlementService';

describe('EntitlementService', () => {
  beforeEach(() => {
    // Reset the service state before each test
    entitlementService._configCache = null;
    entitlementService._apiCache = null;
    entitlementService._initialized = false;
  });

  describe('basic functionality', () => {
    it('should initialize successfully', async () => {
      await entitlementService.initialize();
      expect(entitlementService._initialized).toBe(true);
      expect(entitlementService._configCache).toBeDefined();
    });

    it('should return tenant options as a Promise', async () => {
      const tenantOptions = await entitlementService.getTenantOptions();
      
      expect(tenantOptions).toBeDefined();
      expect(typeof tenantOptions).toBe('object');
      expect(tenantOptions.diku).toBeDefined();
      expect(tenantOptions.test).toBeDefined();
    });

    it('should return config as a Promise', async () => {
      const config = await entitlementService.getConfig();
      
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
      expect(config.tenantOptions).toBeDefined();
    });

    it('should detect when tenant options exist', async () => {
      const hasTenantOptions = await entitlementService.hasTenantOptions();
      expect(hasTenantOptions).toBe(true);
    });

    it('should indicate entitlement mode when tenant options exist', async () => {
      const shouldUse = await entitlementService.shouldUseEntitlementMode();
      expect(shouldUse).toBe(true);
    });

    it('should return specific tenant config', async () => {
      const dikuConfig = await entitlementService.getTenantConfig('diku');
      
      expect(dikuConfig).toEqual({
        name: 'diku',
        clientId: 'diku-application',
        displayName: 'Diku Library'
      });
    });

    it('should return null for non-existent tenant', async () => {
      const config = await entitlementService.getTenantConfig('nonexistent');
      expect(config).toBeNull();
    });
  });

  describe('API entitlement data', () => {
    it('should store and retrieve API entitlement data', async () => {
      const apiData = {
        applicationDescriptors: [
          { id: 'app1', name: 'Application 1' }
        ]
      };

      await entitlementService.setApiEntitlements(apiData);
      const retrieved = await entitlementService.getApiEntitlements();
      
      expect(retrieved).toEqual(apiData);
    });

    it('should return null if no API data is set', async () => {
      const apiData = await entitlementService.getApiEntitlements();
      expect(apiData).toBeNull();
    });
  });

  describe('backwards compatibility functions', () => {
    it('should export getTenantOptions function', async () => {
      const tenantOptions = await getTenantOptions();
      expect(tenantOptions).toBeDefined();
      expect(typeof tenantOptions).toBe('object');
    });

    it('should export getConfig function', async () => {
      const config = await getConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should export shouldUseEntitlementMode function', async () => {
      const shouldUse = await shouldUseEntitlementMode();
      expect(typeof shouldUse).toBe('boolean');
    });
  });
});