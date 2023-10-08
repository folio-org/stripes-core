import localforage from 'localforage';
import { config, translations } from 'stripes-config';
import rtlDetect from 'rtl-detect';
import moment from 'moment';
import createInactivityTimer from 'inactivity-timer';

import { discoverServices } from './discoverServices';
import { resetStore } from './mainActions';

import {
  clearCurrentUser,
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
  setServerDown,
  setSessionData,
  setLoginData,
  updateCurrentUser,
} from './okapiActions';
import processBadResponse from './processBadResponse';
import configureLogger from './configureLogger';

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
  'nb',     // norwegian bokmål"
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
const SESSION_NAME = 'okapiSess';

// export config values for storing user locale
export const userLocaleConfig = {
  'configName': 'localeSettings',
  'module': '@folio/stripes-core',
};

const logger = configureLogger(config);

function getHeaders(tenant) {
  return {
    'X-Okapi-Tenant': tenant,
    'Content-Type': 'application/json',
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
  return perms['configuration.entries.collection.get'];
}

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
    headers: getHeaders(tenant),
    credentials: 'include',
    mode: 'cors',
  })
    .then((response) => {
      if (response.status === 200) {
        response.json().then((json) => {
          if (json.configs.length) {
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
    headers: getHeaders(tenant),
    credentials: 'include',
    mode: 'cors',
  })
    .then((response) => {
      if (response.status < 400) {
        response.json().then((json) => {
          const configs = json.configs.reduce((acc, val) => ({
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
    headers: getHeaders(tenant),
    credentials: 'include',
    mode: 'cors',
  })
    .then((response) => {
      let bindings = {};
      if (response.status >= 400) {
        store.dispatch(setBindings(bindings));
      } else {
        response.json().then((json) => {
          const configs = json.configs;
          if (configs.length > 0) {
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
      }
      return response;
    });
}

/**
 * loadResources
 * return a promise that retrieves the tenant's locale, user's locale,
 * plugins, and key-bindings from mod-configuration.
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 * @param {string} userId user's UUID
 *
 * @returns {Promise}
 */
function loadResources(okapiUrl, store, tenant, userId) {
  let promises = [];

  // tenant's locale, plugin, bindings, and user's locale are all stored
  // in mod-configuration so we can only retrieve them if the user has
  // read-permission for configuration entries.
  if (canReadConfig(store)) {
    promises = [
      getLocale(okapiUrl, store, tenant),
      getUserLocale(okapiUrl, store, tenant, userId),
      getPlugins(okapiUrl, store, tenant),
      getBindings(okapiUrl, store, tenant),
    ];
  }

  if (!store.getState().okapi.withoutOkapi) {
    promises.push(discoverServices(store));
  }

  return Promise.all(promises);
}

/**
 * spreadUserWithPerms
 * return an object { user, perms } based on response from bl-users/self.
 *
 * @param {object} userWithPerms
 *
 * @returns {object}
 */
export function spreadUserWithPerms(userWithPerms) {
  const user = {
    id: userWithPerms.user.id,
    username: userWithPerms.user.username,
    ...userWithPerms.user.personal,
  };

  // remap data's array of permission-names to set with
  // permission-names for keys and `true` for values
  const perms = Object.assign({}, ...userWithPerms.permissions.permissions.map(p => ({ [p.permissionName]: true })));

  return { user, perms };
}

/**
 * logout
 * dispatch events to clear the store, then clear the session too.
 *
 * @param {object} redux store
 *
 * @returns {Promise}
 */
export async function logout(okapiUrl, store) {
  store.dispatch(setIsAuthenticated(false));
  store.dispatch(clearCurrentUser());
  store.dispatch(resetStore());
  return fetch(`${okapiUrl}/authn/logout`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  })
    .then(localforage.removeItem(SESSION_NAME))
    .then(localforage.removeItem('loginResponse'));
}

/**
 * startIdleTimer
 * Start a timer that should last the length of the session,
 * calling the timeout-handler if/when it expires. This function
 * should be called by event-listener that tracks activity: each
 * time the event-listener pings the existing timer will be cancelled
 * and a new one started to keep the session alive.
 *
 * @param {string} okapiUrl to pass to logout
 * @param {redux-store} store to pass to logout
 * @param {object} tokenExpiration shaped like { atExpires, rtExpires }
 *   where each is a millisecond-resolution timestamp
 */
// let idleTimer = null;
// let lastActive = Date.now();
// const startIdleTimer = (okapiUrl, store, tokenExpiration) => {
//   // const threshold = 10 * 1000;
//   const threshold = tokenExpiration.rtExpires - Date.now();
//   idleTimer = createInactivityTimer(threshold, () => {
//     logger.log('rtr', `logging out; no activity since ${new Date(lastActive).toISOString()}`);
//     logout(okapiUrl, store);
//   });
// };

/**
 * dispatchTokenExpiration
 * send SW a TOKEN_EXPIRATION message
 */
const dispatchTokenExpiration = (tokenExpiration) => {
  navigator.serviceWorker.ready
    .then((reg) => {
      const sw = reg.active;
      if (sw) {
        const message = { source: '@folio/stripes-core', type: 'TOKEN_EXPIRATION', tokenExpiration };
        logger.log('rtr', '<= sending', message);
        sw.postMessage(message);
      } else {
        console.warn('could not dispatch message; no active registration');
      }
    });
};

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
 * @param {*} okapiUrl
 * @param {*} store
 * @param {*} tenant
 * @param {*} data
 *
 * @returns {Promise}
 */
export function createOkapiSession(okapiUrl, store, tenant, data) {
  // clear any auth-n errors
  store.dispatch(setAuthError(null));

  // store the raw login response for future parsing by other modules
  // e.g. if optional values are returned, e.g. see UISP-32
  store.dispatch(setLoginData(data));

  const { user, perms } = spreadUserWithPerms(data);

  store.dispatch(setCurrentPerms(perms));

  // if we can't parse tokenExpiration data, e.g. because data comes from `/bl-users/_self`
  // which doesn't provide it, then set an invalid AT value and a near-future (+10 minutes) RT value.
  // the invalid AT will prompt an RTR cycle which will either give us new AT/RT values
  // (if the RT was valid) or throw an RTR_ERROR (if the RT was not valid).
  const tokenExpiration = {
    atExpires: data.tokenExpiration?.accessTokenExpiration ? new Date(data.tokenExpiration.accessTokenExpiration).getTime() : -1,
    rtExpires: data.tokenExpiration?.refreshTokenExpiration ? new Date(data.tokenExpiration.refreshTokenExpiration).getTime() : Date.now() + (10 * 60 * 1000),
  };

  const sessionTenant = data.tenant || tenant;
  const okapiSess = {
    isAuthenticated: true,
    user,
    perms,
    tenant: sessionTenant,
    tokenExpiration,
  };

  // provide token-expiration info to the service worker
  dispatchTokenExpiration(tokenExpiration);

  return localforage.setItem('loginResponse', data)
    .then(() => localforage.setItem(SESSION_NAME, okapiSess))
    .then(() => {
      store.dispatch(setIsAuthenticated(true));
      store.dispatch(setSessionData(okapiSess));
      return loadResources(okapiUrl, store, sessionTenant, user.id);
    });
}

/**
 * addDocumentListeners
 * Attach document-level event handlers for keydown and mousedown in order to
 * track when the session is idle
 *
 * @param {object} okapiConfig okapi attribute from stripes-config
 * @param {object} store redux-store
 */
export function addDocumentListeners(okapiConfig, store) {
  // on any event, set the last-access timestamp and restart the inactivity timer.
  // if the access token has expired, renew it.
  // ['keydown', 'mousedown'].forEach((event) => {
  //   document.addEventListener(event, () => {
  //     localforage.getItem(SESSION_NAME)
  //       .then(session => {
  //         if (session?.isAuthenticated && idleTimer) {
  //           idleTimer.signal();
  //           // @@ remove this; it's just for debugging
  //           lastActive = Date.now();
  //         }
  //       });
  //   });
  // });

  if ('serviceWorker' in navigator) {
    //
    // listen for messages
    // the only message we expect to receive tells us that RTR happened
    // so we need to update our expiration timestamps
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data.source === '@folio/stripes-core') {
        console.info('-- (rtr) <= reading', e.data);
        if (e.data.type === 'TOKEN_EXPIRATION') {
          // @@ store.setItem is async but we don't care about the response
          // localforage.setItem('tokenExpiration', e.data.tokenExpiration);
          console.log(`-- (rtr) atExpires ${e.data.tokenExpiration.atExpires}`);
          console.log(`-- (rtr) rtExpires ${e.data.tokenExpiration.rtExpires}`);
        }

        if (e.data.type === 'RTR_ERROR') {
          console.error('-- (rtr) rtr error; logging out', e.data.error);

          store.dispatch(setIsAuthenticated(false));
          store.dispatch(clearCurrentUser());
          store.dispatch(resetStore());
          localforage.removeItem(SESSION_NAME)
            .then(localforage.removeItem('loginResponse'));
        }
      }
    });
  }
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
      if (response.status >= 400) {
        store.dispatch(checkSSO(false));
        return null;
      } else {
        return response.json()
          .then((json) => {
            store.dispatch(checkSSO(json.active));
          });
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
  if (resp.status < 400) {
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
 * authentication request or a bl-users/_self request.
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 * @param {Response} resp HTTP response
 *
 * @returns {Promise} resolving with login response body, rejecting with, ummmmm
 */
export function processOkapiSession(okapiUrl, store, tenant, resp) {
  const { dispatch } = store;

  if (resp.ok) {
    return resp.json()
      .then(json => {
        return createOkapiSession(okapiUrl, store, tenant, json)
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
 * return a promise that fetches from bl-users/self.
 * if successful, dispatch the result to create a session
 * if not, clear the session and token.
 *
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 * @param {object} session
 *
 * @returns {Promise}
 */
export function validateUser(okapiUrl, store, tenant, session) {
  const { user, perms, tenant: sessionTenant = tenant } = session;
  console.log('validateUser; existing session');
  return fetch(`${okapiUrl}/bl-users/_self`, {
    headers: getHeaders(sessionTenant),
    credentials: 'include',
    mode: 'cors',
  }).then((resp) => {
    if (resp.ok) {
      return resp.json().then((data) => {
        // clear any auth-n errors
        store.dispatch(setAuthError(null));
        store.dispatch(setLoginData(data));

        // if we can't parse tokenExpiration data, e.g. because data comes from `/bl-users/_self`
        // which doesn't provide it, then set an invalid AT value and a near-future (+10 minutes) RT value.
        // the invalid AT will prompt an RTR cycle which will either give us new AT/RT values
        // (if the RT was valid) or throw an RTR_ERROR (if the RT was not valid).
        const tokenExpiration = {
          atExpires: -1,
          rtExpires: Date.now() + (10 * 60 * 1000),
        };
        // provide token-expiration info to the service worker
        dispatchTokenExpiration(tokenExpiration);

        store.dispatch(setSessionData({
          isAuthenticated: true,
          user,
          perms,
          tenant: sessionTenant,
          tokenExpiration,
        }));
        return loadResources(okapiUrl, store, sessionTenant, user.id);

        /*

        store.dispatch(setCurrentPerms(data.permissions.permissions));

        return localforage.setItem('loginResponse', data)
          .then(() => localforage.setItem(SESSION_NAME, okapiSess))
          .then(() => {
            store.dispatch(setIsAuthenticated(true));
            store.dispatch(setSessionData(okapiSess));
            return loadResources(okapiUrl, store, sessionTenant, user.id);
          });
          */
      });
    } else {
      return logout(okapiUrl, store);
    }
  }).catch((error) => {
    console.error(error);
    store.dispatch(setServerDown());
    return error;
  });
}

/**
 * checkOkapiSession
 * 1. Pull the session from local storage; if non-empty validate it, dispatching load-resources actions.
 * 2. Check if SSO (SAML) is enabled, dispatching check-sso actions
 * 3. dispatch set-okapi-ready.
 *
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 */
export function checkOkapiSession(okapiUrl, store, tenant) {
  localforage.getItem(SESSION_NAME)
    .then((sess) => {
      return sess !== null ? validateUser(okapiUrl, store, tenant, sess) : null;
    })
    .then(() => {
      return getSSOEnabled(okapiUrl, store, tenant);
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
  return fetch(`${okapiUrl}/bl-users/login-with-expiry?expandPermissions=true&fullPermissions=true`, {
    body: JSON.stringify(data),
    credentials: 'include',
    headers: { 'X-Okapi-Tenant': tenant, 'Content-Type': 'application/json' },
    method: 'POST',
    mode: 'cors',
  })
    .then(resp => processOkapiSession(okapiUrl, store, tenant, resp));
}

/**
 * fetchUserWithPerms
 * retrieve currently-authenticated user
 * @param {string} okapiUrl
 * @param {string} tenant
 *
 * @returns {Promise} Promise resolving to the response of the request
 */
function fetchUserWithPerms(okapiUrl, tenant) {
  return fetch(
    `${okapiUrl}/bl-users/_self?expandPermissions=true&fullPermissions=true`,
    { headers: getHeaders(tenant) },
  );
}

/**
 * requestUserWithPerms
 * retrieve currently-authenticated user, then process the result to begin a session.
 * @param {string} okapiUrl
 * @param {redux store} store
 * @param {string} tenant
 *
 * @returns {Promise} Promise resolving to the response-body (JSON) of the request
 */
export function requestUserWithPerms(okapiUrl, store, tenant) {
  return fetchUserWithPerms(okapiUrl, tenant)
    .then(resp => processOkapiSession(okapiUrl, store, tenant, resp));
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
  return localforage.getItem(SESSION_NAME)
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
 * @param {object} okapi
 * @param {string} tenant
 *
 * @returns {Promise}
 */
export async function updateTenant(okapi, tenant) {
  const okapiSess = await localforage.getItem(SESSION_NAME);
  const userWithPermsResponse = await fetchUserWithPerms(okapi.url, tenant);
  const userWithPerms = await userWithPermsResponse.json();

  await localforage.setItem(SESSION_NAME, { ...okapiSess, tenant, ...spreadUserWithPerms(userWithPerms) });
}
