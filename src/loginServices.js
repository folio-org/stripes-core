import localforage from 'localforage';
import { config, okapi, translations } from 'stripes-config';
import rtlDetect from 'rtl-detect';
import moment from 'moment';

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
  setServerDown,
  setSessionData,
  setLoginData,
  updateCurrentUser,
} from './okapiActions';
import processBadResponse from './processBadResponse';
import configureLogger from './configureLogger';

import CHANNELS from './constants/channels';
import EVENTS from './constants/events';

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

const logger = configureLogger(config);

/**
 * eventManager
 * Listen and emit events on the given BroadcastChannel, or on `window`,
 * which is channel-less. Since the handler will be the same regardless of
 * an event's origin (i.e. from this window or broadcast from another tab
 * or window) this consolidates handling for events of any given type into
 * a single function with a consistent API.
 *
 * @param {string} channel BroadcastChannel to listen on
 * @returns { listen, emit, bc }
 */
export const eventManager = ({ channel }) => {
  const bc = new BroadcastChannel(channel);

  /**
   * listen: listen for events
   * @param {string|array} t type of event to listen for
   * @param {function} f event handling function
   */
  const listen = (t, f) => {
    const handleType = (eventType, handler) => {
      window.addEventListener(eventType, (e) => {
        logger.log('event', `handle dispatched: ${t}`);
        handler(e, e.detail);
      });
      bc.addEventListener('message', (e) => {
        if (e.data.type === eventType) {
          logger.log('event', `handle broadcast: ${t}`);
          handler(e, e.data.message);
        }
      });
    };

    if (Array.isArray(t)) {
      t.forEach((eventType) => { handleType(eventType, f); });
    } else {
      handleType(t, f);
    }
  };

  /**
   * emit: emit events
   * @param {string|array} t type of event to emit
   * @param {*} m message
   */
  const emit = (t, m) => {
    const handleType = (eventType, message) => {
      logger.log('event', `emit: ${eventType}`);
      window.dispatchEvent(new CustomEvent(eventType, { detail: message }));
      bc.postMessage({
        type: eventType,
        message: m,
      });
    };

    if (Array.isArray(t)) {
      t.forEach((eventType) => { handleType(eventType, m); });
    } else {
      handleType(t, m);
    }
  };

  return {
    listen, emit, bc,
  };
};

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
 * setTokenSess
 * simple wrapper around access to values stored in localforage
 * to insulate RTR functions from that API. Supplement the existing
 * session with updated token expiration data.
 *
 * @param {object} shaped like { atExpires, rtExpires }; each is a millisecond timestamp
 * @returns {object} updated session object
 */
export const setTokenExpiry = async (te) => {
  const sess = await getOkapiSession();

  return localforage.setItem(SESSION_NAME, { ...sess, tokenExpiration: te })
    .then(storedValue => {
      const em = eventManager({ channel: CHANNELS.AUTHN });
      em.emit(EVENTS.AUTHN.RTR_SUCCESS, te);
      em.bc.close();

      return storedValue;
    });
};

// export config values for storing user locale
export const userLocaleConfig = {
  'configName': 'localeSettings',
  'module': '@folio/stripes-core',
};

export function getHeaders(tenant, token) {
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
export function canReadConfig(store) {
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
    headers: getHeaders(tenant, store.getState().okapi.token),
    credentials: 'include',
    mode: 'cors',
  })
    .then((response) => {
      if (response.status === 200) {
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
      if (response.status < 400) {
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
  return fetch(`${okapiUrl}/configurations/entries?query=(module==ORG and configName==bindings)`,
    {
      credentials: 'include',
      headers: getHeaders(tenant, store.getState().okapi.token),
      mode: 'cors',
    })
    .then((response) => {
      let bindings = {};
      if (response.status >= 400) {
        store.dispatch(setBindings(bindings));
      } else {
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
      }
      return response;
    });
}

/**
 * loadResources
 * return a promise that retrieves the tenant's locale, user's locale,
 * plugins, and key-bindings from mod-configuration, as well as retreiving
 * module information directly from okapi.
 *
 * @param {redux store} store
 * @param {string} tenant
 * @param {string} userId user's UUID
 *
 * @returns {Promise}
 */
function loadResources(store, tenant, userId) {
  let promises = [];

  // tenant's locale, plugin, bindings, and user's locale are all stored
  // in mod-configuration so we can only retrieve them if the user has
  // read-permission for configuration entries.
  if (canReadConfig(store)) {
    promises = [
      getLocale(okapi.url, store, tenant),
      getUserLocale(okapi.url, store, tenant, userId),
      getPlugins(okapi.url, store, tenant),
      getBindings(okapi.url, store, tenant),
    ];
  }

  if (!store.getState().okapi.withoutOkapi) {
    promises.push(discoverServices(store));
  }

  return Promise.all(promises);
}

/**
 * spreadUserWithPerms
 * return an object { user, perms } based on response from .../_self.
 *
 * @param {object} userWithPerms
 *
 * @returns {object}
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
  // userWithPerms is shaped differently depending on whether
  // it comes from a login call or a `.../_self` call, which
  // is just totally totally awesome. :|
  // we'll parse it differently depending on what it looks like.

  let perms = {};
  const list = userWithPerms?.permissions?.permissions;
  if (list && Array.isArray(list) && list.length > 0) {
    // _self sends data like ["foo", "bar", "bat"]
    // login sends data like [{ "permissionName": "foo" }]
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
 * dispatch events to clear the store, then clear the session,
 * clear localStorage, and call `/authn/logout` to end the session
 * on the server too.
 *
 * @param {string}
 * @param {object} store redux store
 * @param {bool} stopPropagation whether to emit a logout event
 *
 * @returns {Promise}
 */
export async function logout(okapiUrl, store, stopPropagation = false) {
  // tenant is necessary to populate the X-Okapi-Tenant header
  // which is required in ECS environments
  const { okapi: { tenant } } = store.getState();
  store.dispatch(setIsAuthenticated(false));
  store.dispatch(clearCurrentUser());
  store.dispatch(clearOkapiToken());
  store.dispatch(resetStore());
  return fetch(`${okapiUrl}/authn/logout`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: { 'X-Okapi-Tenant': tenant, 'Accept': 'application/json' },
  })
    .then(localStorage.removeItem('tenant'))
    .then(localforage.removeItem(SESSION_NAME))
    .then(localforage.removeItem('loginResponse'))
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(`Error logging out: ${JSON.stringify(error)}`);
    })
    .finally(() => {
      // if this function was called _in response_ to a logout event,
      // we don't want to emit _another_ logout event
      if (!stopPropagation) {
        const em = eventManager({ channel: CHANNELS.AUTHN });
        em.emit(EVENTS.AUTHN.LOGOUT);
        em.bc.close();
      }
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

  const sessionTenant = data.tenant || tenant;
  const okapiSess = {
    token,
    isAuthenticated: true,
    user,
    perms,
    tenant: sessionTenant,
  };

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
 * return a promise that fetches from .../_self.
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
  const { token, tenant: sessionTenant = tenant, tokenExpiration } = session;
  const usersPath = okapi.authnUrl ? 'users-keycloak' : 'bl-users';

  return fetch(`${okapiUrl}/${usersPath}/_self`, {
    headers: getHeaders(sessionTenant, token),
    credentials: 'include',
    mode: 'cors',
  }).then((resp) => {
    if (resp.ok) {
      return resp.json().then((data) => {
        const { user, perms } = spreadUserWithPerms(data);

        const okapiSess = {
          isAuthenticated: true,
          user,
          perms,
          tenant: sessionTenant,
          token,
          tokenExpiration,
        };
        // clear any auth-n errors
        store.dispatch(setAuthError(null));
        store.dispatch(setLoginData(data));
        store.dispatch(setSessionData(okapiSess));

        return loadResources(store, sessionTenant, okapiSess.user.id);
      });
    } else {
      return logout(okapiUrl, store);
    }
  }).catch((error) => {
    console.error('validateUser', { error }); // eslint-disable-line no-console
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
  getOkapiSession()
    .then((sess) => {
      return sess !== null ? validateUser(okapiUrl, store, tenant, sess) : null;
    })
    .then(() => {
      if (store.getState().discovery?.interfaces?.['login-saml']) {
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
 * @param {object} okapi object from stripes.config.js
 * @param {redux store} store
 * @param {string} tenant
 * @param {object} data
 *
 * @returns {Promise}
 */
export function requestLogin(okapiUrl, store, tenant, data) {
  // got Keycloak?
  if (okapi.authnUrl) {
    return fetch(okapi.authnUrl, {
      method: 'POST',
      body: new URLSearchParams({
        ...data,
        'grant_type': 'password',
        'client_id': okapi.clientId,
        'client_secret': okapi.clientSecret,
      })
    })
      .then(resp => processOkapiSession(store, tenant, resp));
  } else {
    // legacy built-in authentication
    const loginPath = config.useSecureTokens ? 'login-with-expiry' : 'login';
    return fetch(`${okapiUrl}/bl-users/${loginPath}?expandPermissions=true&fullPermissions=true`, {
      body: JSON.stringify(data),
      credentials: 'include',
      headers: { 'X-Okapi-Tenant': tenant, 'Content-Type': 'application/json' },
      method: 'POST',
      mode: 'cors',
    })
      .then(resp => processOkapiSession(store, tenant, resp));
  }
}

/**
 * fetchUserWithPerms
 * retrieve currently-authenticated user
 * @param {string} okapiUrl
 * @param {string} tenant
 *
 * @returns {Promise} Promise resolving to the response of the request
 */
function fetchUserWithPerms(okapiUrl, tenant, token) {
  const usersPath = okapi.authnUrl ? 'users-keycloak' : 'bl-users';
  return fetch(
    `${okapiUrl}/${usersPath}/_self?expandPermissions=true&fullPermissions=true`,
    {
      credentials: 'include',
      headers: getHeaders(tenant, token),
      mode: 'cors',
    },
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
export function requestUserWithPerms(okapiUrl, store, tenant, token) {
  return fetchUserWithPerms(okapiUrl, tenant, token)
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
  const userWithPermsResponse = await fetchUserWithPerms(okapiConfig.url, tenant, okapiConfig.token);
  const userWithPerms = await userWithPermsResponse.json();

  await localforage.setItem(SESSION_NAME, { ...okapiSess, tenant, ...spreadUserWithPerms(userWithPerms) });
}
