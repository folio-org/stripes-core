
/**
 * If StripesHub is present in localstorage, override config values as StripesHub is now the source of truth.
 *
 * @param {object} okapi the Okapi config object from stripes.config.js.
 * @param {object} config the Stripes config object from stripes.config.js.
 * @param {object} branding the branding config from stripes.config.js.
 * @param {object} stripesHub the config object from StripesHub.
 * @returns Updated config object with values from Stripes Hub if available, or default to stripes.config.js
 */
export const getStripesHubConfig = (okapi, config, branding, stripesHub) => {
  let stripesConfig = config;
  let stripesOkapi = okapi;
  let stripesBranding = branding;

  if (stripesHub) {
    // Pass URLs from FOLIO config into Okapi config.
    stripesOkapi = stripesHub.discoveryUrl ? { ...okapi, discoveryUrl: stripesHub.discoveryUrl } : okapi;
    stripesOkapi = stripesHub.folioConfig?.gatewayUrl ? { ...stripesOkapi, url: stripesHub.folioConfig.gatewayUrl } : stripesOkapi;
    stripesOkapi = stripesHub.folioConfig?.authnUrl ? { ...stripesOkapi, authnUrl: stripesHub.folioConfig.authnUrl } : stripesOkapi;

    // Pass all FOLIO config values from StripesHub config into Stripes config.
    stripesConfig = stripesHub.folioConfig ? { ...stripesConfig, ...stripesHub.folioConfig } : stripesConfig;

    // Remove URLs that StripesHub consolidates into FOLIO config, but classic Stripes expects to find in Okapi config.
    delete stripesConfig.discoveryUrl;
    delete stripesConfig.gatewayUrl;
    delete stripesConfig.authnUrl;

    stripesBranding = stripesHub.brandingConfig ? { ...branding, ...stripesHub.brandingConfig } : branding;
  }

  return { stripesOkapi, stripesConfig, stripesBranding };
};
