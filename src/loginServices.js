import localforage from 'localforage';
import { config, okapi, translations } from 'stripes-config';
import rtlDetect from 'rtl-detect';
import moment from 'moment';
import { loadDayJSLocale } from '@folio/stripes-components';

import { discoverServices } from './discoverServices';
import { resetStore } from './mainActions';

import {
  clearCurrentUser,
  clearOkapiToken,
  setCurrentPerms,
  setLocale,
  setTimezone,
  setCurrency,
  setPlugins,
  setBindings,
  setTranslations,
  setIsAuthenticated,
  setAuthError,
  checkSSO,
  setOkapiReady,
  setSessionData,
  setLoginData,
  updateCurrentUser,
} from './okapiActions';
import processBadResponse from './processBadResponse';

import {
  RTR_TIMEOUT_EVENT
} from './components/Root/constants';
import { settings } from './constants';

// export supported locales, i.e. the languages we provide translations for
export const supportedLocales = [
  'ar',     // arabic
  'cs-CZ',  // czech, czechia
  'da-DK',  // danish, denmark
  'de-DE',  // german, germany
  'en-GB',  // british english
  'en-SE',  // english, sweden
  'en-US',  // american english
  'es-419', // latin american spanish
  'es-ES',  // european spanish
  'es',     // spanish
  'fr-FR',  // french, france
  'he',     // hebrew
  'hi-IN',  // hindi, india
  'hu-HU',  // hugarian, hungry
  'it-IT',  // italian, italy
  'ja',     // japanese
  'ko',     // korean
  'nb',     // norwegian bokmål
  'nl',     // dutch, flemish
  'nn',     // norwegian nynorsk
  'pl',     // polish
  'pt-BR',  // portuguese, brazil
  'pt-PT',  // portuguese, portugal
  'ru',     // russian
  'sv',     // swedish
  'ur',     // urdu
  'zh-CN',  // chinese, china
  'zh-TW',  // chinese, taiwan
];

// export supported numbering systems, i.e. the systems tenants may chose
// for numeral display
export const supportedNumberingSystems = [
  'latn',  // Arabic (0 1 2 3 4 5 6 7 8 9)
  'arab',  // Arabic-Hindi (٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩)
];

/** name for the session key in local storage */
export const SESSION_NAME = 'okapiSess';

/**
 * getTokenSess
 * simple wrapper around access to values stored in localforage
 * to insulate RTR functions from that API.
 *
 * @returns {object}
 */
export const getOkapiSession = async () => {
  return localforage.getItem(SESSION_NAME);
};

/**
 * getTokenSess
 * simple wrapper around access to values stored in localforage
 * to insulate RTR functions from that API.
 *
 * @returns {object} shaped like { atExpires, rtExpires }; each is a millisecond timestamp
 */
export const getTokenExpiry = async () => {
  const sess = await getOkapiSession();
  return new Promise((resolve) => resolve(sess?.tokenExpiration));
};

/**
 * getTokenSess
 * simple wrapper around access to values stored in localforage
 * to insulate RTR functions from that API. Supplement the existing
 * session with updated token expiration data.
 *
 * @param {object} shaped like { atExpires, rtExpires }; each is a millisecond timestamp
 * @returns {object} updated session object
 */
export const setTokenExpiry = async (te) => {
  const sess = await getOkapiSession();
  const val = { ...sess, tokenExpiration: te };
  return localforage.setItem(SESSION_NAME, val);
};

/**
 * removeUnauthorizedPathFromSession, setUnauthorizedPathToSession, getUnauthorizedPathFromSession
 * remove/set/get unauthorized_path to/from session storage.
 * Used to restore path on returning from login if user accessed a bookmarked
 * URL while unauthenticated and was redirected to login, and when a session
 * times out, forcing the user to re-authenticate.
 *
 * @see components/OIDCRedirect
 */
const UNAUTHORIZED_PATH = 'unauthorized_path';
export const removeUnauthorizedPathFromSession = () => sessionStorage.removeItem(UNAUTHORIZED_PATH);
export const setUnauthorizedPathToSession = (pathname) => {
  const path = pathname ?? `${window.location.pathname}${window.location.search}`;
  if (!path.startsWith('/logout')) {
    sessionStorage.setItem(UNAUTHORIZED_PATH, path);
  }
};
export const getUnauthorizedPathFromSession = () => sessionStorage.getItem(UNAUTHORIZED_PATH);

export const getOIDCRedirectUri = (tenant, clientId) => {
  // we need to use `encodeURIComponent` to separate `redirect_uri` URL parameters from the rest of URL parameters that `redirect_uri` itself is part of
  return encodeURIComponent(`${window.location.protocol}//${window.location.host}/oidc-landing?tenant=${tenant}&client_id=${clientId}`);
};

export const getTenantAndClientIdFromLoginURL = () => {
  const urlParams = new URLSearchParams(window.location.search);

  return {
    tenantName: urlParams.get('tenant'),
    clientId: urlParams.get('client_id'),
  };
};

// export config values for storing user locale
export const userLocaleConfig = {
  'configName': 'localeSettings',
  'module': '@folio/stripes-core',
};

// config values for storing user locale in mod-settings
export const userOwnLocaleConfig = {
  SCOPE: settings.SCOPE,
  KEY: 'localeSettings',
};

// config values for storing tenant locale
export const tenantLocaleConfig = {
  SCOPE: settings.SCOPE,
  KEY: 'tenantLocaleSettings',
};

function getHeaders(tenant, token) {
  return {
    'X-Okapi-Tenant': tenant,
    'Content-Type': 'application/json',
    ...(token && { 'X-Okapi-Token': token }),
  };
}

/**
 * canReadConfig
 * return true if the user has read-permission for configuration entries,
 * i.e. if the store contains the key
 * okapi.currentPerms['configuration.entries.collection.get'].
 *
 * @param {object} store a redux store
 *
 * @returns {boolean}
 */
function canReadConfig(store) {
  const perms = store.getState().okapi.currentPerms;
  return perms?.['configuration.entries.collection.get'];
}

/**
 * Checks if the current user has sufficient permissions to read from mod-settings.
 *
 * This function verifies that the user has the required permission to access the settings entries,
 * and that the user also has at least one permission to manage their settings preferences.
 *
 * @param {Object} store - The store containing application state.
 * @returns {boolean} True if the user possesses the required permissions for reading settings, false otherwise.
 */
const canReadSettings = (store) => {
  const perms = store.getState().okapi.currentPerms;

  return (
    perms?.['mod-settings.entries.collection.get']
    && (perms?.['mod-settings.global.read.stripes-core.prefs.manage'] || perms?.['mod-settings.owner.read.stripes-core.prefs.manage'])
  );
};

/**
 * loadTranslations
 * return a promise that fetches translations for the given locale and then
 * dispatches the locale and translations.
 * @param {redux store} store
 * @param {string} locale
 * @param {object} defaultTranslations
 *
 * @returns {Promise}
 */
export function loadTranslations(store, locale, defaultTranslations = {}) {
  const parentLocale = locale.split('-')[0];
  // Since moment.js don't support translations like it or it-IT-u-nu-latn
  // we need to build string like it_IT for fetch call
  const loadedLocale = locale.replace('-', '_').split('-')[0];
  const momentLocale = locale.split('-', 2).join('-');

  // react-intl provides things like pt-BR.
  // lokalise provides things like pt_BR.
  // so we have to translate '-' to '_' because the translation libraries
  // don't know how to talk to each other. sheesh.
  const region = locale.replace('-', '_');

  // Update dir- and lang-attributes on the HTML element
  // when the locale changes
  document.documentElement.setAttribute('lang', locale);
  document.documentElement.setAttribute('dir', rtlDetect.getLangDir(parentLocale));

  // Set locale for Moment.js (en is not importable as it is not stored separately)
  if (parentLocale === 'en') moment.locale(parentLocale);
  else {
    // For moment, we want to import and load the most-specific
    // locale possible without the numbering system suffix,
    // e.g. it-IT if available, falling back to it if that fails.
    import(`moment/locale/${momentLocale}`).then(() => {
      moment.locale(momentLocale);
    }).catch(() => {
      import(`moment/locale/${parentLocale}`).then(() => {
        moment.locale(parentLocale);
      }).catch(e => {
        // eslint-disable-next-line no-console
        console.error(`Error loading locale ${parentLocale} for Moment.js`, e);
      });
    });
  }

  // load DayJS Locale. DayJS is expected to replace Moment as Stripes' date/time library.
  // As with moment. loading the DayJS locale here passes it down to UI-modules so that they don't have to
  // load the static locale data themselves.
  loadDayJSLocale(locale);

  // Here we put additional condition because languages
  // like Japan we need to use like ja, but with numeric system
  // Japan language builds like ja_u, that incorrect. We need to be safe from that bug.
  return fetch(translations[region] ? translations[region] :
    translations[loadedLocale] || translations[[parentLocale]])
    .then((response) => {
      if (response.ok) {
        response.json().then((stripesTranslations) => {
          store.dispatch(setTranslations(Object.assign(stripesTranslations, defaultTranslations)));
          store.dispatch(setLocale(locale));
        });
      }
    });
}

/**
 * dispatchLocale
 * Given a URL where locale, timezone, and currency information may be stored,
 * request the data then dispatch appropriate actions for facet, if available.
 *
 * @param {string} url location of locale information
 * @param {object} store redux store
 * @param {string} tenant
 * @returns {Promise}
 */
function dispatchLocale(url, store, tenant) {
  return fetch(url, {
    headers: getHeaders(tenant, store.getState().okapi.token),
    credentials: 'include',
    mode: 'cors',
  })
    .then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          if (json.configs?.length) {
            const localeValues = JSON.parse(json.configs[0].value);
            const { locale, timezone, currency } = localeValues;
            if (locale) {
              loadTranslations(store, locale);
            }
            if (timezone) store.dispatch(setTimezone(timezone));
            if (currency) store.dispatch(setCurrency(currency));
          }
        });
      }

      return response;
    });
}

/**
 * getLocale
 * return a promise that retrieves the tenant's locale-settings then
 * loads the translations and dispatches the timezone and currency.
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 *
 * @returns {Promise}
 */
export function getLocale(okapiUrl, store, tenant) {
  const query = [
    'module==ORG',
    'configName == localeSettings',
    '(cql.allRecords=1 NOT userId="" NOT code="")'
  ].join(' AND ');

  return dispatchLocale(
    `${okapiUrl}/configurations/entries?query=(${query})`,
    store,
    tenant
  );
}

/**
 * getUserLocale
 * return a promise that retrieves the user's locale-settings then
 * loads the translations and dispatches the timezone and currency.
 * @param {*} okapiUrl
 * @param {*} store
 * @param {*} tenant
 *
 * @returns {Promise}
 */
export function getUserLocale(okapiUrl, store, tenant, userId) {
  const query = Object.entries(userLocaleConfig)
    .map(([k, v]) => `"${k}"=="${v}"`)
    .join(' AND ');

  return dispatchLocale(
    `${okapiUrl}/configurations/entries?query=(${query} and userId=="${userId}")`,
    store,
    tenant
  );
}

/**
 * getPlugins
 * return a promise that retrieves the tenant's plugins and dispatches them.
 * @param {} okapiUrl
 * @param {*} store
 * @param {*} tenant
 *
 * @returns {Promise}
 */
export function getPlugins(okapiUrl, store, tenant) {
  return fetch(`${okapiUrl}/configurations/entries?query=(module==PLUGINS)`, {
    credentials: 'include',
    headers: getHeaders(tenant, store.getState().okapi.token),
    mode: 'cors',
  })
    .then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          const configs = json.configs?.reduce((acc, val) => ({
            ...acc,
            [val.configName]: val.value,
          }), {});
          store.dispatch(setPlugins(configs));
        });
      }
      return response;
    });
}

/**
 * getBindings
 * return a promise that retrieves the tenant's key-bindings and dispatches them
 * @param {} okapiUrl
 * @param {*} store
 * @param {*} tenant
 *
 * @returns {Promise}
 */
export function getBindings(okapiUrl, store, tenant) {
  return fetch(`${okapiUrl}/configurations/entries?query=(module==ORG and configName==bindings)`, {
    headers: getHeaders(tenant, store.getState().okapi.token),
    credentials: 'include',
    mode: 'cors',
  })
    .then((response) => {
      let bindings = {};
      if (response.ok) {
        response.json().then((json) => {
          const configs = json.configs;
          if (Array.isArray(configs) && configs.length > 0) {
            const string = configs[0].value;
            try {
              const tmp = JSON.parse(string);
              bindings = tmp; // only if no exception is thrown
            } catch (err) {
              // eslint-disable-next-line no-console
              console.log(`getBindings cannot parse key bindings '${string}':`, err);
            }
          }
          store.dispatch(setBindings(bindings));
        });
      } else {
        store.dispatch(setBindings(bindings));
      }
      return response;
    });
}

/**
 * Fetch the locale data from the provided URL.
 *
 * @param {string} url - The URL from which to fetch locale data.
 * @param {object} store - The store providing state access to retrieve the OKAPI token.
 * @param {string} tenant - The tenant name for which the locale settings are being requested.
 * @returns {Promise} A promise that resolves to the fetch API's response.
 */
const fetchLocale = (url, store, tenant) => {
  return fetch(url, {
    headers: getHeaders(tenant, store.getState().okapi.token),
    credentials: 'include',
    mode: 'cors',
  });
};

/**
 * Retrieves the tenant's locale setting from the mod-settings.
 *
 * Constructs a query based on preset scope and tenant locale configuration constants, then
 * fetches the locale data by making an HTTP request to the settings entries endpoint.
 *
 * @param {string} url - The base URL for the settings API endpoint.
 * @param {Object} store - The store object used to manage application state.
 * @param {string} tenant - The tenant name for which the locale settings are being requested.
 * @returns {Promise} A promise that resolves with the locale configuration data.
 */
const getTenantLocale = (url, store, tenant) => {
  const query = `scope=="${settings.SCOPE}" and key=="${tenantLocaleConfig.KEY}"`;

  return fetchLocale(
    `${url}/settings/entries?query=(${query})`,
    store,
    tenant
  );
};

/**
 * Retrieves the user's own locale setting from the mod-settings.
 *
 * This function constructs a query string to filter settings entries based on the provided userId,
 * a predefined scope, and key. It then delegates the fetching of the locale data to the fetchLocale
 * function using the constructed query.
 *
 * @param {string} url - The base URL for the settings API endpoint.
 * @param {Object} store - The store object used to manage application state.
 * @param {string} tenant - The tenant name for which the locale settings are being requested.
 * @param {string} userId - The unique identifier for the user.
 * @returns {Promise} A promise resolving with the user's locale settings information.
 */
const getUserOwnLocale = (url, store, tenant, userId) => {
  const query = `userId=="${userId}" and scope=="${settings.SCOPE}" and key=="${userOwnLocaleConfig.KEY}"`;

  return fetchLocale(
    `${url}/settings/entries?query=(${query})`,
    store,
    tenant
  );
};

/**
 * Applies locale settings by loading translations and dispatching actions to update timezone and currency.
 *
 * @param {string} [locale] - The locale identifier used to load translations. If provided, it triggers loading translations.
 * @param {string} [timezone] - The timezone setting to apply. Dispatches an action to update the store if provided.
 * @param {string} [currency] - The currency setting to apply. Dispatches an action to update the store if provided.
 * @param {Object} store - The store object used to dispatch actions for updating timezone and currency.
 */
const applyLocaleSettings = (locale, timezone, currency, store) => {
  if (locale) {
    loadTranslations(store, locale);
  }

  if (timezone) store.dispatch(setTimezone(timezone));
  if (currency) store.dispatch(setCurrency(currency));
};

/**
 * Generates a full locale string by combining a language-region and a numbering system
 * with the Unicode extension key '-u-nu-' (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/numberingSystem).
 * If no language-region is provided, the function returns null.
 *
 * @param {string} [languageRegion] - A locale string, such as "en-US". If omitted, the value is obtained from document.documentElement.lang.
 * @param {string} [numberingSystem] - A numbering system, such as "latn", to append to the locale.
 * @returns {string|null} The constructed locale string combining the language-region and the numbering system, or null if languageRegion is not provided.
 */
export const getFullLocale = (languageRegion, numberingSystem) => {
  if (!languageRegion) return null;

  const unicodeExtensionKey = '-u-nu-';

  return [languageRegion, numberingSystem].filter(Boolean).join(unicodeExtensionKey);
};



/**
 * Processes and applies locale settings to the given store based on tenant and user locale data.
 *
 * The function retrieves locale-specific settings from both tenantLocaleData and userLocaleData. If the user settings indicate
 * that tenant settings should be used (via the empty locale or locale equality), then the tenant's locale, numbering system,
 * timezone, and currency values take precedence over the user's own values. It then computes a full locale string using the
 * getFullLocale function and applies the final locale settings including the timezone and currency to the store using
 * applyLocaleSettings.
 *
 * @param {Object} store - The store instance where locale settings are applied.
 * @param {Object} tenantLocaleData - An object containing tenant's settings.
 * @param {Object} userLocaleData - An object containing user's settings.
 *
 * @returns {void}
 */
const processLocaleSettings = (store, tenantLocaleData, userLocaleData) => {
  const tenantLocaleSettings = tenantLocaleData?.items[0]?.value;
  const userLocaleSettings = userLocaleData?.items[0]?.value;

  const locale = userLocaleSettings?.locale || tenantLocaleSettings?.locale;
  const numberingSystem = userLocaleSettings?.numberingSystem || tenantLocaleSettings?.numberingSystem;
  const timezone = userLocaleSettings?.timezone || tenantLocaleSettings?.timezone;
  const currency = userLocaleSettings?.currency || tenantLocaleSettings?.currency;

  const fullLocale = getFullLocale(locale, numberingSystem);

  applyLocaleSettings(fullLocale, timezone, currency, store);
};

// This function is used to support the deprecated mod-configuration API.
// It is only used when the new mod-settings API returns empty settings.
const getLocalesPromise = (url, store, tenant, userId) => {
  return Promise.all([
    getLocale(url, store, tenant),
    getUserLocale(url, store, tenant, userId),
  ]);
};

/**
 * loadResources
 * return a promise that retrieves the tenant's locale, user's locale,
 * plugins, and key-bindings from mod-configuration and/or mod-settings, as well as retrieving
 * module information directly from okapi.
 *
 * @param {redux store} store
 * @param {string} tenant
 * @param {string} userId user's UUID
 *
 * @returns {Promise}
 *
 * It builds an array of promises based on available user permissions.
 * First, if the user can read mod-settings, it fetches locale information using two endpoints (one for tenant and one for the user)
 * using Promise.allSettled. When these calls return, it checks if at least one response contains a valid setting.
 * If so, it applies those settings; otherwise, if the user has mod-configuration reading permission, it fetches locale information
 * using the mod-configuration API for both user and tenant settings and applies them.
 * If the user doesn't have mod-settings permission but has mod-configuration permission, it fetches locale information using the mod-configuration API.
 * Additionally, if the user has mod-configuration permission, it fetches plugins and bindings by calling getPlugins and getBindings.
 * It also checks if the okapi instance is not in "withoutOkapi" mode, it fetches module information using discoverServices.
 * Finally, it returns a flattened array of all the results from the promises.
 */
export async function loadResources(store, tenant, userId) {
  const promises = [];
  const okapiUrl = store.getState()?.okapi.url;
  const hasReadConfigPerm = canReadConfig(store);

  if (canReadSettings(store)) {
    const localesPromise = Promise.allSettled([
      getTenantLocale(okapiUrl, store, tenant),
      getUserOwnLocale(okapiUrl, store, tenant, userId),
    ])
      .then(async (responses) => {
        const [tenantLocaleData, userLocaleData] = await Promise.all(responses.map(res => res.value?.json?.()));
        const hasSetting = tenantLocaleData?.items[0] || userLocaleData?.items[0];

        if (hasSetting) {
          processLocaleSettings(store, tenantLocaleData, userLocaleData);

          return responses.map(res => res?.value);
        }

        if (hasReadConfigPerm) {
          return getLocalesPromise(okapiUrl, store, tenant, userId);
        }

        return null;
      });

    promises.push(localesPromise);
  } else if (hasReadConfigPerm) {
    promises.push(getLocalesPromise(okapiUrl, store, tenant, userId));
  }

  // tenant's locale, plugin, bindings, and user's locale are all stored
  // in mod-configuration so we can only retrieve them if the user has
  // read-permission for configuration entries.
  if (hasReadConfigPerm) {
    const okapiObject = store.getState()?.okapi;

    promises.push(
      getPlugins(okapiObject.url, store, tenant),
      getBindings(okapiObject.url, store, tenant),
    );
  }

  if (!store.getState().okapi.withoutOkapi) {
    promises.push(discoverServices(store));
  }

  const result = await Promise.all(promises);

  return result.flat();
}

/**
 * spreadUserWithPerms
 * Restructure the response from `bl-users/self?expandPermissions=true`
 * to return an object shaped like
 * {
 *   user: { id, username, ...personal }
 *   perms: { foo: true, bar: true, ... }
 * }
 *
 * @param {object} userWithPerms
 *
 * @returns {object} { user, perms }
 */
export function spreadUserWithPerms(userWithPerms) {
  const user = {
    id: userWithPerms?.user?.id,
    username: userWithPerms?.user?.username,
    ...userWithPerms?.user?.personal,
  };

  // remap data's array of permission-names to set with
  // permission-names for keys and `true` for values.
  //
  // userWithPerms is shaped differently depending on the API call
  // that generated it.
  // in community-folio, /login sends data like [{ "permissionName": "foo" }]
  //   and includes both directly and indirectly assigned permissions
  // in community-folio, /_self sends data like ["foo", "bar", "bat"]
  //   but only includes directly assigned permissions
  // in community-folio, /_self?expandPermissions=true sends data like [{ "permissionName": "foo" }]
  //   and includes both directly and indirectly assigned permissions
  // in eureka-folio, /_self sends data like ["foo", "bar", "bat"]
  //   and includes both directly and indirectly assigned permissions
  //
  // we'll parse it differently depending on what it looks like.
  let perms = {};
  const list = userWithPerms?.permissions?.permissions;
  if (list && Array.isArray(list) && list.length > 0) {
    // shaped like this ["foo", "bar", "bat"] or
    // shaped like that [{ "permissionName": "foo" }]?
    if (typeof list[0] === 'string') {
      perms = Object.assign({}, ...list.map(p => ({ [p]: true })));
    } else {
      perms = Object.assign({}, ...list.map(p => ({ [p.permissionName]: true })));
    }
  }

  return { user, perms };
}

/**
 * logout
 * logout is a multi-part process, but this function is idempotent.
 * 1.  there are server-side things to do, i.e. fetch /authn/logout.
 *     these must only be done once, no matter how many tabs are open
 *     because once the fetch completes the cookies are gone, which
 *     means a repeat request will fail.
 * 2.  there is shared storage to clean out, i.e. storage that is shared
 *     across tabs such as localStorage and localforage. clearing storage
 *     that another tab has already cleared is fine, if pointless.
 * 3.  there is private storage to clean out, i.e. storage that is unique
 *     to the current tab/window. this storage _must_ be cleared in each
 *     instance of stripes (i.e. in each separate tab/window) because the
 *     instances running in other tabs do not have access to it.
 * What does all this mean? It means some things we need to check on and
 * maybe do (the server-side things), some we can do (the shared storage)
 * and some we must do (the private storage).
 *
 * @param {string} okapiUrl
 * @param {object} redux store
 *
 * @returns {Promise}
 */
export const IS_LOGGING_OUT = '@folio/stripes/core::Logout';

export const TENANT_LOCAL_STORAGE_KEY = 'tenant';

export const storeLogoutTenant = (tenantId) => {
  localStorage.setItem(TENANT_LOCAL_STORAGE_KEY, JSON.stringify({ tenantId }));
};

export const getLogoutTenant = () => {
  const storedTenant = localStorage.getItem(TENANT_LOCAL_STORAGE_KEY);
  return storedTenant ? JSON.parse(storedTenant) : undefined;
};

export async function logout(okapiUrl, store, queryClient) {
  // check the private-storage sentinel: if logout has already started
  // in this window, we don't want to start it again.
  if (sessionStorage.getItem(IS_LOGGING_OUT)) {
    return Promise.resolve();
  }

  // check the shared-storage sentinel: if logout has already started
  // in another window, we don't want to invoke shared functions again
  // (like calling /authn/logout, which can only be called once)
  // BUT we DO want to clear private storage such as session storage
  // and redux, which are not shared across tabs/windows.
  const logoutPromise = localStorage.getItem(SESSION_NAME) ?
    fetch(`${okapiUrl}/authn/logout`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      /* Since the tenant in the x-okapi-token and the x-okapi-tenant header on logout should match,
      switching affiliations updates store.okapi.tenant, leading to mismatched tenant names from the token.
      Use the tenant name stored during login to ensure they match.
        */
      headers: getHeaders(getLogoutTenant()?.tenantId || store.getState()?.okapi?.tenant),
    })
    :
    Promise.resolve();

  return logoutPromise
    // clear private-storage
    .then(() => {
      // set the private-storage sentinel to indicate logout is in-progress
      sessionStorage.setItem(IS_LOGGING_OUT, 'true');

      // localStorage events emit across tabs so we can use it like a
      // BroadcastChannel to communicate with all tabs/windows
      localStorage.removeItem(SESSION_NAME);
      localStorage.removeItem(RTR_TIMEOUT_EVENT);
      localStorage.removeItem(TENANT_LOCAL_STORAGE_KEY);

      store.dispatch(setIsAuthenticated(false));
      store.dispatch(clearCurrentUser());
      store.dispatch(clearOkapiToken());
      store.dispatch(resetStore());

      // clear react-query cache
      if (queryClient) {
        queryClient.removeQueries();
      }
    })
    // clear shared storage
    .then(localforage.removeItem(SESSION_NAME))
    .then(localforage.removeItem('loginResponse'))
    .catch(e => {
      console.error('error during logout', e); // eslint-disable-line no-console
    })
    .finally(() => {
      // clear the console unless config asks to preserve it
      if (!config.preserveConsole) {
        console.clear(); // eslint-disable-line no-console
      }
      // clear the storage sentinel
      sessionStorage.removeItem(IS_LOGGING_OUT);
    });
}

/**
 * createOkapiSession
 * Remap the given data into a session object shaped like:
 * {
 *   user: { id, username, personal }
 *   tenant: string,
 *   perms: { permNameA: true, permNameB: true, ... }
 *   isAuthenticated: boolean,
 *   tokenExpiration: { atExpires, rtExpires }
 * }
 * Dispatch the session object, then return a Promise that fetches
 * and dispatches tenant resources.
 *
 * @param {object} store redux store
 * @param {string} tenant tenant name
 * @param {string} token access token [deprecated; prefer folioAccessToken cookie]
 * @param {*} data
 *
 * @returns {Promise}
 */
export function createOkapiSession(store, tenant, token, data) {
  // clear any auth-n errors
  store.dispatch(setAuthError(null));

  // store the raw login response for future parsing by other modules
  // e.g. if optional values are returned, e.g. see UISP-32
  store.dispatch(setLoginData(data));

  const { user, perms } = spreadUserWithPerms(data);

  store.dispatch(setCurrentPerms(perms));

  // if we can't parse tokenExpiration data, e.g. because data comes from `.../_self`
  // which doesn't provide it, then set an invalid AT value and a near-future (+10 minutes) RT value.
  // the invalid AT will prompt an RTR cycle which will either give us new AT/RT values
  // (if the RT was valid) or throw an RTR_ERROR (if the RT was not valid).
  const tokenExpiration = {
    atExpires: data.tokenExpiration?.accessTokenExpiration ? new Date(data.tokenExpiration.accessTokenExpiration).getTime() : -1,
    rtExpires: data.tokenExpiration?.refreshTokenExpiration ? new Date(data.tokenExpiration.refreshTokenExpiration).getTime() : Date.now() + (10 * 60 * 1000),
  };

  /* @ See the comments for fetchOverriddenUserWithPerms.
  * There are consortia(multi-tenant) and non-consortia modes/envs.
  * We don't want to care if it is consortia or non-consortia modes, just use fetchOverriderUserWithPerms on login to initiate the session.
  * 1. In consortia mode, fetchOverriderUserWithPerms returns originalTenantId.
  * 2. In non-consortia mode, fetchOverriderUserWithPerms won't response with originalTenantId,
  * instead `tenant` field will be provided.
  * 3. As a fallback use default tenant.
  */
  const sessionTenant = data.originalTenantId || data.tenant || tenant;
  const okapiSess = {
    token,
    isAuthenticated: true,
    user,
    perms,
    tenant: sessionTenant,
    tokenExpiration,
  };

  // localStorage events emit across tabs so we can use it like a
  // BroadcastChannel to communicate with all tabs/windows.
  // here, we set a dummy 'true' value just so we have something to
  // remove (and therefore emit and respond to) on logout
  localStorage.setItem(SESSION_NAME, 'true');

  return localforage.setItem('loginResponse', data)
    .then(localforage.getItem(SESSION_NAME))
    .then(sessionData => {
      // for keycloak-based logins, token-expiration data was already
      // pushed to storage, so we pull it out and reuse it here.
      // for legacy logins, token-expiration data is available in the
      // login response.
      if (sessionData?.tokenExpiration) {
        okapiSess.tokenExpiration = sessionData.tokenExpiration;
      } else if (data.tokenExpiration) {
        okapiSess.tokenExpiration = {
          atExpires: new Date(data.tokenExpiration.accessTokenExpiration).getTime(),
          rtExpires: new Date(data.tokenExpiration.refreshTokenExpiration).getTime(),
        };
      } else {
        // somehow, we ended up here without any legit token-expiration values.
        // that's not great, but in theory we only ended up here as a result
        // of logging in, so let's punt and assume our cookies are valid.
        // set an expired AT and RT 10 minutes into the future; the expired
        // AT will kick off RTR, and on success we'll store real values as a result,
        // or on failure we'll get kicked out. no harm, no foul.
        okapiSess.tokenExpiration = {
          atExpires: -1,
          rtExpires: Date.now() + (10 * 60 * 1000),
        };
      }

      return localforage.setItem(SESSION_NAME, okapiSess);
    })
    .then(() => {
      store.dispatch(setIsAuthenticated(true));
      store.dispatch(setSessionData(okapiSess));
      return loadResources(store, sessionTenant, user.id);
    });
}

/**
 * getSSOEnabled
 * return a promise that fetches from /saml/check and dispatches checkSSO.
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 *
 * @returns {Promise}
 */
export function getSSOEnabled(okapiUrl, store, tenant) {
  return fetch(`${okapiUrl}/saml/check`, { headers: { 'X-Okapi-Tenant': tenant, 'Accept': 'application/json' } })
    .then((response) => {
      if (response.ok) {
        return response.json()
          .then((json) => {
            store.dispatch(checkSSO(json.active));
          });
      } else {
        store.dispatch(checkSSO(false));
        return null;
      }
    })
    .catch(() => {
      store.dispatch(checkSSO(false));
    });
}

/**
 * processSSOLoginResponse
 * handle the return from SSO:
 * for a POST binding, populate a form and submit it
 * for a GET binding, navigate to the requested location
 * @param {object} resp fetch Response
 */
function processSSOLoginResponse(resp) {
  if (resp.ok) {
    resp.json().then((json) => {
      const form = document.getElementById('ssoForm');
      if (json.bindingMethod === 'POST') {
        form.setAttribute('action', json.location);
        form.setAttribute('method', json.bindingMethod);

        const samlRequest = document.createElement('input');
        samlRequest.setAttribute('type', 'hidden');
        samlRequest.setAttribute('name', 'SAMLRequest');
        samlRequest.setAttribute('value', json.samlRequest);
        form.appendChild(samlRequest);

        const relayState = document.createElement('input');
        relayState.setAttribute('type', 'hidden');
        relayState.setAttribute('name', 'RelayState');
        relayState.setAttribute('value', json.relayState);
        form.appendChild(relayState);

        form.submit();
      } else {
        window.open(json.location, '_self');
      }
    });
  }
}

/**
 * handleLoginError
 * Clear out session data, dispatch authentication errors, then dispatch
 * okapi-ready to indicate that we're ready to start fresh. Return the
 * response-body, er, JSON, from the failed auth-n request.
 *
 * @param {function} dispatch store.dispatch
 * @param {Response} resp HTTP response from a failed auth-n request
 *
 * @returns {Promise} resolving to the response's JSON
 */
export function handleLoginError(dispatch, resp) {
  return localforage.removeItem(SESSION_NAME)
    .then(() => processBadResponse(dispatch, resp))
    .then(responseBody => {
      dispatch(setOkapiReady());
      return responseBody;
    });
}

/**
 * processOkapiSession
 * create a new okapi session with the response from either a username/password
 * authentication request or a .../_self request.
 * response body is shaped like
 * {
    'access_token': 'SOME_STRING',
    'expires_in': 420,
    'refresh_expires_in': 1800,
    'refresh_token': 'SOME_STRING',
    'token_type': 'Bearer',
    'not-before-policy': 0,
    'session_state': 'SOME_UUID',
    'scope': 'profile email'
 * }
 *
 * @param {redux store} store
 * @param {string} tenant
 * @param {Response} resp HTTP response
 *
 * @returns {Promise} resolving with login response body, rejecting with, ummmmm
 */
export function processOkapiSession(store, tenant, resp, ssoToken) {
  const { dispatch } = store;

  if (resp.ok) {
    return resp.json()
      .then(json => {
        const token = resp.headers.get('X-Okapi-Token') || json.access_token || ssoToken;
        return createOkapiSession(store, tenant, token, json)
          .then(() => json);
      })
      .then((json) => {
        store.dispatch(setOkapiReady());
        return json;
      });
  } else {
    return handleLoginError(dispatch, resp);
  }
}

/**
 * validateUser
 * Data in localstorage has led us to believe a session is active. To confirm,
 * fetch from .../_self and dispatch the results, allowing any changes to authz
 * since that session data was persisted to take effect immediately.
 *
 * If the fetch succeeds, dispatch the result to update the session.
 * Otherwise, call logout() to purge redux and storage because either:
 *   1. the session data was corrupt. yikes!
 *   2. the session data was valid but cookies were missing. yikes!
 * Either way, our belief that a session is active has been proven wrong, so
 * we want to clear out all relevant storage.
 *
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 * @param {object} session
 * @param {function} handleError error-handler function; returns a Promise that returns null
 *
 * @returns {Promise}
 */
export function validateUser(okapiUrl, store, tenant, session, handleError) {
  const { token, tenant: sessionTenant = tenant } = session;
  const usersPath = store.getState()?.okapi?.authnUrl ? 'users-keycloak' : 'bl-users';
  return fetch(`${okapiUrl}/${usersPath}/_self?expandPermissions=true`, {
    headers: getHeaders(sessionTenant, token),
    credentials: 'include',
    mode: 'cors',
  }).then((resp) => {
    if (resp.ok) {
      return resp.json().then((data) => {
        // clear any auth-n errors
        store.dispatch(setAuthError(null));
        store.dispatch(setLoginData(data));

        const { user, perms } = spreadUserWithPerms(data);
        store.dispatch(setCurrentPerms(perms));

        // update the session data with values from the response from _self
        // in case they have changed since the previous login. this allows
        // permissions changes to take effect immediately, without needing to
        // re-authenticate.
        //
        // tenant and tokenExpiration data are still pulled from the session,
        // tenant because the user may have switched the session-tenant to
        // something other than their default and tokenExpiration because that
        // data isn't provided by _self.
        store.dispatch(setSessionData({
          isAuthenticated: true,
          // spread data from the previous session (which may include session-specific
          // values such as the current service point), and the restructured user object
          // (which includes permissions in a lookup-friendly way)
          user: { ...session.user, ...user },
          perms,
          tenant: sessionTenant,
          token,
          tokenExpiration: session.tokenExpiration
        }));

        return loadResources(store, sessionTenant, user.id);
      });
    } else {
      return resp.text().then(text => {
        throw text;
      });
    }
  }).catch((error) => {
    // log a warning, then call the error handler if we received one
    console.error(error); // eslint-disable-line no-console
    return handleError ? handleError() : Promise.resolve();
  });
}

/**
 * checkOkapiSession
 * 1. Pull the session from local storage; if it contains a user id,
 *    validate it by fetching /_self to verify that it is still active,
 *    dispatching load-resources actions.
 * 2. Check if SSO (SAML) is enabled, dispatching check-sso actions
 * 3. dispatch set-okapi-ready.
 *
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 */
export function checkOkapiSession(okapiUrl, store, tenant) {
  getOkapiSession()
    .then((sess) => {
      const handleError = () => logout(okapiUrl, store);
      return sess?.user?.id ? validateUser(okapiUrl, store, tenant, sess, handleError) : null;
    })
    .then((res) => {
      // check whether SSO is enabled if either
      // 1. res is null (when we are starting a new session)
      // 2. login-saml interface is present (when we are resuming an existing session)
      if (!res || store.getState().discovery?.interfaces?.['login-saml']) {
        return getSSOEnabled(okapiUrl, store, tenant);
      }
      return Promise.resolve();
    })
    .finally(() => {
      store.dispatch(setOkapiReady());
    });
}

/**
 * requestLogin
 * authenticate with a username and password. return a promise that posts the values
 * and then processes the result to begin a session.
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 * @param {object} data
 *
 * @returns {Promise}
 */
export function requestLogin(okapiUrl, store, tenant, data) {
  const loginPath = 'login-with-expiry';
  return fetch(`${okapiUrl}/bl-users/${loginPath}?expandPermissions=true&fullPermissions=true`, {
    body: JSON.stringify(data),
    credentials: 'include',
    headers: { 'X-Okapi-Tenant': tenant, 'Content-Type': 'application/json' },
    method: 'POST',
    mode: 'cors',
  })
    .then(resp => processOkapiSession(store, tenant, resp));
}

/**
 * fetchUserWithPerms
 * retrieve currently-authenticated user data, e.g. after switching affiliations, and we want permissions for the current tenant
 * @param {string} okapiUrl
 * @param {string} tenant
 * @param {string} token
 * @param {boolean} rtrIgnore
 *
 * @returns {Promise} Promise resolving to the response of the request
 */
function fetchUserWithPerms(okapiUrl, tenant, token, rtrIgnore = false) {
  const usersPath = okapi.authnUrl ? 'users-keycloak' : 'bl-users';
  return fetch(
    `${okapiUrl}/${usersPath}/_self?expandPermissions=true&fullPermissions=true`,
    {
      headers: getHeaders(tenant, token),
      rtrIgnore,
    },
  );
}

/**
 * fetchOverriddenUserWithPerms
 * When starting a session after turning from OIDC authentication, the user's current tenant
 * (provided to X-Okapi-Tenant) may not match the central tenant. overrideUser=true query allow us to
 * retrieve a real user's tenant permissions and service points even if X-Okapi-Tenant == central tenant.
 * Example, we have user `exampleUser` that directly affiliated with `Member tenant` and for central tenant exampleUser is a shadow user.
 * Previously, we had to log in to central tenant as a shadow user, and then switch the affiliation.
 * But providing query overrideUser=true, we fetch the real user's tenant with its permissions and service points.
 * Response looks like this, {originalTenantId: "Member tenant", permissions: {permissions: [...memberTenantPermissions]}, ...rest}.
 * Now, we can set the originalTenantId to the session with fetched permissions and servicePoints.
 * Compare with fetchUserWithPerms, which only fetches data from the current tenant, which is called during an established session when switching tenants.
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 * @param {string} token
 *
 * @returns {Promise} Promise resolving to the response-body (JSON) of the request
 */

export function fetchOverriddenUserWithPerms(okapiUrl, tenant, token, rtrIgnore = false) {
  const usersPath = okapi.authnUrl ? 'users-keycloak' : 'bl-users';
  return fetch(
    `${okapiUrl}/${usersPath}/_self?expandPermissions=true&fullPermissions=true&overrideUser=true`,
    {
      headers: getHeaders(tenant, token),
      rtrIgnore,
    },
  );
}

/**
 * requestUserWithPerms
 * retrieve currently-authenticated user, then process the result to begin a session.
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 * @param {string} token
 *
 * @returns {Promise} Promise resolving to the response-body (JSON) of the request
 */
export function requestUserWithPerms(okapiUrl, store, tenant, token) {
  return fetchOverriddenUserWithPerms(okapiUrl, tenant, token, !token)
    .then((resp) => {
      if (resp.ok) {
        return processOkapiSession(store, tenant, resp, token);
      } else {
        return resp.json().then((error) => {
          throw error;
        });
      }
    });
}

/**
 * requestSSOLogin
 * authenticate via SSO/SAML
 * @param {string} okapiUrl
 * @param {string} tenant
 *
 * @returns {Promise}
 */
export function requestSSOLogin(okapiUrl, tenant) {
  const stripesUrl = (window.location.origin || `${window.location.protocol}//${window.location.host}`) + window.location.pathname;
  // the /_/invoke/... URL is used for systems that make call-backs
  // to okapi and don't handle setting of the tenant in the HTTP header.
  // i.e. ordinarily, we'd just call ${okapiUrl}/saml/login.
  // https://s3.amazonaws.com/foliodocs/api/okapi/p/okapi.html#invoke_tenant__id_
  return fetch(`${okapiUrl}/_/invoke/tenant/${tenant}/saml/login`, {
    method: 'POST',
    headers: { 'X-Okapi-tenant': tenant, 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ stripesUrl }),
  })
    .then(resp => processSSOLoginResponse(resp));
}

/**
 * updateUser
 * 1. concat the given data onto local-storage user and save it
 * 2. dispatch updateCurrentUser, concating given data onto the session user
 * @param {redux-store} store redux store
 * @param {object} data
 *
 * @returns {Promise}
 */
export function updateUser(store, data) {
  return getOkapiSession()
    .then((sess) => {
      sess.user = { ...sess.user, ...data };
      return localforage.setItem(SESSION_NAME, sess);
    })
    .then(() => {
      store.dispatch(updateCurrentUser(data));
    });
}

/**
 * updateTenant
 * 1. prepare user info for requested tenant
 * 2. update okapi session
 * @param {object} okapiConfig
 * @param {string} tenant
 *
 * @returns {Promise}
 */
export async function updateTenant(okapiConfig, tenant) {
  const okapiSess = await getOkapiSession();
  const userWithPermsResponse = await fetchUserWithPerms(okapiConfig.url, tenant, okapiConfig.token, false);
  const userWithPerms = await userWithPermsResponse.json();
  await localforage.setItem(SESSION_NAME, { ...okapiSess, tenant, ...spreadUserWithPerms(userWithPerms) });
}
