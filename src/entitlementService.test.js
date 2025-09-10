/**
 * Tests for the entitlement service
 */

import {
  getEntitlements,
  getConfig,
  getModules,
  getBranding,
  getMetadata,
  getIcons,
  getTranslations,
  getOkapiConfig,
  clearCache,
  hasTenantOptions,
  fetchDynamicEntitlements,
  legacyModules
} from './entitlementService';

// Mock stripes-config
jest.mock('stripes-config', () => ({
  config: {
    tenantOptions: { test: { name: 'test-tenant' } },
    preserveConsole: false,
  },
  modules: {
    app: {
      'test-app': { module: '@folio/test-app', displayName: 'Test App' }
    },
    plugin: {
      'test-plugin': { module: '@folio/test-plugin', pluginType: 'test' }
    }
  },
  okapi: {
    url: 'http://localhost:9130',
    tenant: 'diku',
    clientId: 'test-client',
  },
  translations: {
    en: 'http://localhost:3000/translations/en.json',
    es: 'http://localhost:3000/translations/es.json',
  },
  branding: {
    logo: {
      src: '/path/to/logo.png',
      alt: 'Test Logo'
    }
  },
  metadata: {
    '@folio/test-app': {
      name: 'test-app',
      version: '1.0.0'
    }
  },
  icons: {
    '@folio/test-app': '/path/to/icon.png'
  }
}));

describe('entitlementService', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('getEntitlements', () => {
    it('returns a promise that resolves to all entitlement data', async () => {
      const entitlements = await getEntitlements();
      
      expect(entitlements).toHaveProperty('modules');
      expect(entitlements).toHaveProperty('config');
      expect(entitlements).toHaveProperty('okapi');
      expect(entitlements).toHaveProperty('translations');
      expect(entitlements).toHaveProperty('branding');
      expect(entitlements).toHaveProperty('metadata');
      expect(entitlements).toHaveProperty('icons');
    });

    it('caches the result for subsequent calls', async () => {
      const entitlements1 = await getEntitlements();
      const entitlements2 = await getEntitlements();
      
      expect(entitlements1).toBe(entitlements2);
    });
  });

  describe('getConfig', () => {
    it('returns a promise that resolves to config data', async () => {
      const config = await getConfig();
      
      expect(config).toHaveProperty('tenantOptions');
      expect(config).toHaveProperty('preserveConsole');
      expect(config.preserveConsole).toBe(false);
    });

    it('caches the result for subsequent calls', async () => {
      const config1 = await getConfig();
      const config2 = await getConfig();
      
      expect(config1).toBe(config2);
    });
  });

  describe('getModules', () => {
    it('returns a promise that resolves to modules data', async () => {
      const modules = await getModules();
      
      expect(modules).toHaveProperty('app');
      expect(modules).toHaveProperty('plugin');
      expect(modules.app).toHaveProperty('test-app');
      expect(modules.plugin).toHaveProperty('test-plugin');
    });
  });

  describe('getBranding', () => {
    it('returns a promise that resolves to branding data', async () => {
      const branding = await getBranding();
      
      expect(branding).toHaveProperty('logo');
      expect(branding.logo).toHaveProperty('src');
      expect(branding.logo.src).toBe('/path/to/logo.png');
    });
  });

  describe('getMetadata', () => {
    it('returns a promise that resolves to metadata', async () => {
      const metadata = await getMetadata();
      
      expect(metadata).toHaveProperty('@folio/test-app');
      expect(metadata['@folio/test-app']).toHaveProperty('name', 'test-app');
      expect(metadata['@folio/test-app']).toHaveProperty('version', '1.0.0');
    });
  });

  describe('getIcons', () => {
    it('returns a promise that resolves to icons data', async () => {
      const icons = await getIcons();
      
      expect(icons).toHaveProperty('@folio/test-app');
      expect(icons['@folio/test-app']).toBe('/path/to/icon.png');
    });
  });

  describe('getTranslations', () => {
    it('returns a promise that resolves to translations configuration', async () => {
      const translations = await getTranslations();
      
      expect(translations).toHaveProperty('en');
      expect(translations).toHaveProperty('es');
      expect(translations.en).toBe('http://localhost:3000/translations/en.json');
    });
  });

  describe('getOkapiConfig', () => {
    it('returns a promise that resolves to okapi configuration', async () => {
      const okapiConfig = await getOkapiConfig();
      
      expect(okapiConfig).toHaveProperty('url', 'http://localhost:9130');
      expect(okapiConfig).toHaveProperty('tenant', 'diku');
      expect(okapiConfig).toHaveProperty('clientId', 'test-client');
    });
  });

  describe('clearCache', () => {
    it('clears the entitlement cache', async () => {
      // Get entitlements to populate cache
      const entitlements1 = await getEntitlements();
      
      // Clear cache
      clearCache();
      
      // Get entitlements again - should be a new promise
      const entitlements2 = await getEntitlements();
      
      expect(entitlements1).not.toBe(entitlements2);
      expect(entitlements1).toEqual(entitlements2);
    });
  });

  describe('hasTenantOptions', () => {
    it('returns true when tenant options exist', async () => {
      const hasTenant = await hasTenantOptions();
      expect(hasTenant).toBe(true);
    });
  });

  describe('fetchDynamicEntitlements', () => {
    it('returns static entitlements for now (future extension point)', async () => {
      const entitlements = await fetchDynamicEntitlements({ tenant: 'test', token: 'abc123' });
      
      expect(entitlements).toHaveProperty('modules');
      expect(entitlements).toHaveProperty('config');
    });
  });

  describe('legacyModules', () => {
    it('provides direct access to modules for backwards compatibility', () => {
      expect(legacyModules).toHaveProperty('app');
      expect(legacyModules).toHaveProperty('plugin');
    });
  });

  describe('error handling', () => {
    it('handles missing config gracefully', async () => {
      // Mock a config that might be undefined
      jest.doMock('stripes-config', () => ({
        config: undefined,
        modules: {},
        okapi: {},
        translations: {},
        branding: {},
        metadata: {},
        icons: {}
      }));

      clearCache();
      
      const config = await getConfig();
      expect(config).toEqual({
        preserveConsole: false,
        tenantOptions: { test: { name: 'test-tenant' } }
      });
    });
  });
});
