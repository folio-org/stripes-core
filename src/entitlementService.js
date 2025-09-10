/**
 * Entitlement Service
 * 
 * Provides a Promise-based interface for accessing entitlement data.
 * This service handles both static configuration from stripes-config 
 * and dynamic API responses, preparing for future backwards-compatible 
 * async entitlement loading.
 */

import { config, modules, okapi, translations, branding, metadata, icons } from 'stripes-config';

/**
 * Cache for entitlement data to avoid repeated Promise creation
 */
let entitlementCache = null;
let configCache = null;

/**
 * Get entitlement data from stripes-config wrapped in a Promise
 * This maintains backwards compatibility while providing the async interface
 * needed for future dynamic loading features.
 * 
 * @returns {Promise<Object>} Promise resolving to entitlement configuration
 */
export function getEntitlements() {
  if (entitlementCache) {
    return entitlementCache;
  }

  entitlementCache = Promise.resolve({
    modules,
    config,
    okapi,
    translations,
    branding,
    metadata,
    icons,
  });

  return entitlementCache;
}

/**
 * Get static configuration data wrapped in a Promise
 * 
 * @returns {Promise<Object>} Promise resolving to static config
 */
export function getConfig() {
  if (configCache) {
    return configCache;
  }

  configCache = Promise.resolve(config);
  return configCache;
}

/**
 * Get modules configuration wrapped in a Promise
 * 
 * @returns {Promise<Object>} Promise resolving to modules configuration
 */
export function getModules() {
  return getEntitlements().then(entitlements => entitlements.modules);
}

/**
 * Get branding configuration wrapped in a Promise
 * 
 * @returns {Promise<Object>} Promise resolving to branding configuration
 */
export function getBranding() {
  return getEntitlements().then(entitlements => entitlements.branding);
}

/**
 * Get metadata configuration wrapped in a Promise
 * 
 * @returns {Promise<Object>} Promise resolving to metadata configuration
 */
export function getMetadata() {
  return getEntitlements().then(entitlements => entitlements.metadata);
}

/**
 * Get okapi configuration wrapped in a Promise
 * 
 * @returns {Promise<Object>} Promise resolving to okapi configuration
 */
export function getOkapi() {
  return getEntitlements().then(entitlements => entitlements.okapi);
}

/**
 * Get icons configuration wrapped in a Promise
 * 
 * @returns {Promise<Object>} Promise resolving to icons configuration
 */
export function getIcons() {
  return getEntitlements().then(entitlements => entitlements.icons);
}

/**
 * Get translations configuration wrapped in a Promise
 * 
 * @returns {Promise<Object>} Promise resolving to translations configuration
 */
export function getTranslations() {
  return getEntitlements().then(entitlements => entitlements.translations);
}

/**
 * Get okapi configuration wrapped in a Promise
 * 
 * @returns {Promise<Object>} Promise resolving to okapi configuration
 */
export function getOkapiConfig() {
  return getEntitlements().then(entitlements => entitlements.okapi);
}

/**
 * Clear the entitlement cache
 * Useful for testing or when entitlements need to be refreshed
 */
export function clearCache() {
  entitlementCache = null;
  configCache = null;
}

/**
 * Check if tenant options are available
 * This determines whether to use API-based or config-based discovery
 * 
 * @returns {Promise<boolean>} Promise resolving to whether tenant options exist
 */
export function hasTenantOptions() {
  return getConfig().then(config => !!config.tenantOptions);
}

/**
 * Future extension point for dynamic entitlement loading
 * This function can be enhanced later to fetch entitlements from APIs
 * 
 * @param {Object} options - Options for fetching entitlements
 * @param {string} options.tenant - Tenant identifier
 * @param {string} options.token - Authentication token
 * @param {string} options.okapiUrl - Okapi URL
 * @returns {Promise<Object>} Promise resolving to entitlement data
 */
export function fetchDynamicEntitlements(options = {}) {
  // For now, return static entitlements
  // This will be expanded in future work to support dynamic loading
  return getEntitlements();
}

/**
 * Backwards compatibility export
 * Provides direct access to modules for legacy code
 * @deprecated Use getModules() instead for async handling
 */
export { modules as legacyModules };
