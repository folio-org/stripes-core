import { config as staticConfig, okapi as staticOkapi } from 'stripes-config';

/**
 * ConfigService
 * 
 * Provides Promise-based access to configuration data that may include entitlement information.
 * This service wraps static configuration in async interface to prepare for future 
 * dynamic configuration loading scenarios.
 */
class ConfigService {
  constructor() {
    this.configPromise = null;
  }

  /**
   * Get configuration data as a Promise
   * @returns {Promise<Object>} Promise that resolves to configuration data
   */
  getConfig() {
    if (!this.configPromise) {
      // Wrap static config in Promise for consistent async interface
      this.configPromise = Promise.resolve({
        ...staticConfig,
        // Add async flag to indicate this was loaded via async interface
        _loadedAsync: true,
        _loadedAt: new Date().toISOString()
      });
    }
    return this.configPromise;
  }

  /**
   * Get tenant options specifically (entitlement-related config)
   * @returns {Promise<Object>} Promise that resolves to tenant options
   */
  getTenantOptions() {
    return this.getConfig().then(config => config.tenantOptions || {});
  }

  /**
   * Get Okapi configuration
   * @returns {Promise<Object>} Promise that resolves to Okapi config
   */
  getOkapiConfig() {
    return Promise.resolve({
      ...staticOkapi,
      _loadedAsync: true,
      _loadedAt: new Date().toISOString()
    });
  }

  /**
   * Get all configuration data including entitlement-related settings
   * @returns {Promise<Object>} Promise that resolves to all config data
   */
  getAllConfig() {
    return Promise.all([
      this.getConfig(),
      this.getOkapiConfig()
    ]).then(([config, okapi]) => ({
      config,
      okapi,
      _loadedAsync: true,
      _loadedAt: new Date().toISOString()
    }));
  }

  /**
   * Check if a specific tenant option exists
   * @param {string} tenantName - Name of the tenant to check
   * @returns {Promise<boolean>} Promise that resolves to existence status
   */
  hasTenantOption(tenantName) {
    return this.getTenantOptions().then(options => 
      Boolean(options[tenantName])
    );
  }

  /**
   * Get specific tenant configuration
   * @param {string} tenantName - Name of the tenant
   * @returns {Promise<Object|null>} Promise that resolves to tenant config or null
   */
  getTenantConfig(tenantName) {
    return this.getTenantOptions().then(options => 
      options[tenantName] || null
    );
  }

  /**
   * Reset the service (useful for testing)
   * @private
   */
  _reset() {
    this.configPromise = null;
  }
}

/**
 * Singleton instance holder for the default config service
 */
let defaultService = null;

/**
 * Get the default config service instance
 * @returns {ConfigService} The default ConfigService instance
 */
export function getConfigService() {
  if (!defaultService) {
    defaultService = new ConfigService();
  }
  return defaultService;
}

/**
 * Factory function to create a new ConfigService instance
 * @returns {ConfigService} New ConfigService instance
 */
export function createConfigService() {
  return new ConfigService();
}

/**
 * Reset the default service (useful for testing)
 */
export function resetConfigService() {
  if (defaultService) {
    defaultService._reset();
  }
  defaultService = null;
}

export default ConfigService;