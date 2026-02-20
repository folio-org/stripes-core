import { stripesHubAPI } from '../../constants';

export const getStripesHubConfig = () => {
  try {
    const folioConfig = JSON.parse(localStorage.getItem(stripesHubAPI.FOLIO_CONFIG_KEY) || '{}');
    const brandingConfig = JSON.parse(localStorage.getItem(stripesHubAPI.BRANDING_CONFIG_KEY) || '{}');
    return { folioConfig, brandingConfig };
  } catch (error) {
    // If there was an error parsing the config from StripesHub, return empty objects so that we fall back to stripes.config.js values.
    return { folioConfig: {}, brandingConfig: {} };
  }
};

/**
 * If StripesHub is present in localstorage, override config values as StripesHub is now the source of truth.
 *
 * @param {object} okapi the Okapi config object from stripes.config.js.
 * @param {object} config the Stripes config object from stripes.config.js.
 * @param {object} branding the branding config from stripes.config.js.
 * @param {object} stripesHub the config object from StripesHub.
 * @returns Updated config object with values from Stripes Hub if available, or default to stripes.config.js
 */
export const getOverrideConfig = (okapi, config, branding, stripesHub) => {
  let stripesConfig = {};
  let stripesOkapi = {};
  let stripesBranding = {};

  // If folioConfig is present in StripesHub, use it to override values from stripes.config.js.
  // Otherwise, use values from stripes.config.js.
  if (stripesHub && stripesHub.folioConfig) {
    // Pass URLs from FOLIO config into Okapi config.
    stripesOkapi.url = stripesHub.folioConfig.gatewayUrl;
    stripesOkapi.authnUrl = stripesHub.folioConfig.authnUrl;

    // Pass all FOLIO config values from StripesHub config into Stripes config.
    stripesConfig = stripesHub.folioConfig;

    // Remove URLs that StripesHub consolidates into FOLIO config, but classic Stripes expects to find in Okapi config.
    delete stripesConfig.gatewayUrl;
    delete stripesConfig.authnUrl;

    stripesBranding = stripesHub.brandingConfig;
  } else {
    stripesOkapi = okapi;
    stripesConfig = config;
    stripesBranding = branding;
  }

  return { stripesOkapi, stripesConfig, stripesBranding };
};
