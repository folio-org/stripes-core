import _ from 'lodash';
import localforage from 'localforage';
import { translations } from 'stripes-config';
import rtlDetect from 'rtl-detect';
import moment from 'moment';

// polyfills for browsers without full Intl.* support. We include only the
// polyfill and en data, since that's all we need to keep NightmareJS and
// its Electron tests happy; adding all the locale data would bloat the bundle
// from <10 MB to >40 MB. The en data only adds ~470 KB.

import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/dist/locale-data/en';
// import '@formatjs/intl-pluralrules/polyfill-locales;
// 0.62 MB stat; 0.43 MB parsed; 0.048 MB GZipped

import '@formatjs/intl-relativetimeformat/polyfill';
import '@formatjs/intl-relativetimeformat/dist/locale-data/en';
// import '@formatjs/intl-relativetimeformat/polyfill-locales;
// 2.3MB stat; 1.8 MB parsed; 0.8 MB GZipped

import '@formatjs/intl-displaynames/polyfill';
import '@formatjs/intl-displaynames/dist/locale-data/en';
// import '@formatjs/intl-displaynames/polyfill-locales;
// 13.7 MB stat; 10.7 MB parsed; 1.9 MB GZipped

import { discoverServices } from './discoverServices';

import {
  clearCurrentUser,
  setCurrentPerms,
  setLocale,
  setTimezone,
  setCurrency,
  setPlugins,
  setBindings,
  setTranslations,
  clearOkapiToken,
  setAuthError,
  checkSSO,
  setOkapiReady,
  setServerDown,
  setSessionData,
  setCurrentServicePoint,
  setUserServicePoints,
} from './okapiActions';
import processBadResponse from './processBadResponse';

// export supported locales, i.e. the languages we provide translations for
export const supportedLocales = [
  'ar',     // arabic
  'zh-CN',  // chinese, china
  'zh-TW',  // chinese, taiwan
  'da-DK',  // danish, denmark
  'en-GB',  // british english
  'en-SE',  // english, sweden
  'en-US',  // american english
  'fr-FR',  // french, france
  'de-DE',  // german, germany
  'he',     // hebrew
  'hi-IN',  // hindi, india
  'hu-HU',  // hugarian, hungry
  'ja',     // japanese
  'ko',     // korean
  'it-IT',  // italian, italy
  'nb',     // norwegian bokmål"
  'nn',     // norwegian nynorsk
  'pl',     // polish
  'pt-BR',  // portuguese, brazil
  'pt-PT',  // portuguese, portugal
  'ru',     // russian
  'es',     // spanish
  'es-419', // latin american spanish
  'es-ES',  // european spanish
  'sv',     // swedish
  'ur',     // urdu
];

function getHeaders(tenant, token) {
  return {
    'X-Okapi-Tenant': tenant,
    'X-Okapi-Token': token,
    'Content-Type': 'application/json',
  };
}

/**
 * loadTranslations
 * return a promise that fetches translations for the given locale and then
 * dispatches the locale and translations.
 * @param {} store
 * @param {*} locale
 * @param {*} defaultTranslations
 *
 * @return Promise
 */
export function loadTranslations(store, locale, defaultTranslations = {}) {
  const parentLocale = locale.split('-')[0];

  // react-intl provides things like pt-BR.
  // lokalise provides things like pt_BR.
  // so we have to translate '-' to '_' because the translation libraries
  // don't know how to talk to each other. sheesh.
  const region = locale.replace('-', '_');

  // Update dir- and lang-attributes on the HTML element
  // when the locale changes
  document.documentElement.setAttribute('lang', parentLocale);
  document.documentElement.setAttribute('dir', rtlDetect.getLangDir(locale));

  // Set locale for Moment.js (en is not importable as it is not stored separately)
  if (parentLocale === 'en') moment.locale(parentLocale);
  else {
    import(`moment/locale/${parentLocale}`).then(() => {
      moment.locale(parentLocale);
    }).catch(e => {
      // eslint-disable-next-line no-console
      console.error(`Error loading locale ${parentLocale} for Moment.js`, e);
    });
  }

  return fetch(translations[region] ? translations[region] : translations[parentLocale])
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
 * getLocale
 * return a promise that retrieves the tenant's locale-settings then
 * loads the translations and dispatches the timezone and currency.
 * @param {*} okapiUrl
 * @param {*} store
 * @param {*} tenant
 *
 * @return Promise
 */
export function getLocale(okapiUrl, store, tenant) {
  return fetch(`${okapiUrl}/configurations/entries?query=(module==ORG and configName==localeSettings)`,
    { headers: getHeaders(tenant, store.getState().okapi.token) })
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
 * getPlugins
 * return a promise that retrieves the tenant's plugins and dispatches them.
 * @param {} okapiUrl
 * @param {*} store
 * @param {*} tenant
 *
 * return Promise
 */
export function getPlugins(okapiUrl, store, tenant) {
  return fetch(`${okapiUrl}/configurations/entries?query=(module==PLUGINS)`,
    { headers: getHeaders(tenant, store.getState().okapi.token) })
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
 */
export function getBindings(okapiUrl, store, tenant) {
  return fetch(`${okapiUrl}/configurations/entries?query=(module==ORG and configName==bindings)`,
    { headers: getHeaders(tenant, store.getState().okapi.token) })
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
 * return a promise that retrieves the tenants locale, plugins, and key-bindings.
 * @param {} okapiUrl
 * @param {*} store
 * @param {*} tenant
 *
 * @return Promise
 */
function loadResources(okapiUrl, store, tenant) {
  const promises = [
    getLocale(okapiUrl, store, tenant),
    getPlugins(okapiUrl, store, tenant),
    getBindings(okapiUrl, store, tenant),
  ];

  if (!store.getState().okapi.withoutOkapi) {
    promises.push(discoverServices(store));
  }

  return Promise.all(promises);
}

/**
 * createOkapiSession
 * Remap the given data into a session object shaped like:
 * {
 *   user: { id, username, personal, servicePoints, curServicePoint }
 *   perms: { permNameA: true, permNameB: true, ... }
 *   token: token
 * }
 * Dispatch the session object, then return a Promise that fetches
 * and dispatches tenant resources.
 *
 * @param {*} okapiUrl
 * @param {*} store
 * @param {*} tenant
 * @param {*} token
 * @param {*} data
 *
 * @return Promise
 */
function createOkapiSession(okapiUrl, store, tenant, token, data) {
  const servicePoints = _.get(data, ['servicePointsUser', 'servicePoints'], []);
  const curSpId = _.get(data, ['servicePointsUser', 'defaultServicePointId']);
  const curServicePoint = (!curSpId && servicePoints.length === 1) ?
    servicePoints[0] :
    servicePoints.find(sp => sp.id === curSpId);

  const user = {
    id: data.user.id,
    username: data.user.username,
    ...data.user.personal,
    servicePoints,
    curServicePoint,
  };

  store.dispatch(setAuthError(null));

  // remap data's array of permission-names to set with
  // permission-names for keys and `true` for values
  const perms = Object.assign({}, ...data.permissions.permissions.map(p => ({ [p.permissionName]: true })));
  store.dispatch(setCurrentPerms(perms));
  const okapiSess = {
    token,
    user,
    perms,
  };
  localforage.setItem('okapiSess', okapiSess);
  store.dispatch(setSessionData(okapiSess));

  return loadResources(okapiUrl, store, tenant);
}

/**
 * validateUser
 * return a promise that fetches from bl-users/self.
 * if successful, dispatch the result to create a session
 * if not, clear the session and token.
 *
 * @param {} okapiUrl
 * @param {*} store
 * @param {*} tenant
 * @param {*} session
 *
 * @return Promise
 */
function validateUser(okapiUrl, store, tenant, session) {
  return fetch(`${okapiUrl}/bl-users/_self`, { headers: getHeaders(tenant, session.token) }).then((resp) => {
    if (resp.status >= 400) {
      store.dispatch(clearCurrentUser());
      store.dispatch(clearOkapiToken());
      localforage.removeItem('okapiSess');
    } else {
      const { token, user, perms } = session;
      store.dispatch(setSessionData({ token, user, perms }));
      return loadResources(okapiUrl, store, tenant);
    }
  }).catch(() => {
    store.dispatch(setServerDown());
  });
}

/**
 * getSSOEnabled
 * return a promise that fetches from /saml/check and dispatches checkSSO.
 * @param {*} okapiUrl
 * @param {*} store
 * @param {*} tenant
 *
 * @return Promise
 */
function getSSOEnabled(okapiUrl, store, tenant) {
  return fetch(`${okapiUrl}/saml/check`, { headers: { 'X-Okapi-Tenant': tenant, 'Accept': 'application/json' } })
    .then((response) => {
      if (response.status >= 400) {
        store.dispatch(checkSSO(false));
      } else {
        response.json().then((json) => {
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
 * @param {*} resp
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

function handleLoginError(dispatch, resp) {
  localforage.removeItem('okapiSess');
  processBadResponse(dispatch, resp);
  dispatch(setOkapiReady());
}

/**
 * processOkapiSession
 * create a new okapi session with the response from either a username/password
 * authentication request or a bl-users/_self request.
 * @param {*} okapiUrl
 * @param {*} store
 * @param {*} tenant
 * @param {*} resp
 * @param {*} ssoToken
 */
function processOkapiSession(okapiUrl, store, tenant, resp, ssoToken) {
  const token = resp.headers.get('X-Okapi-Token') || ssoToken;
  const { dispatch } = store;

  if (resp.status >= 400) {
    handleLoginError(dispatch, resp);
  } else {
    resp.json()
      .then(json => createOkapiSession(okapiUrl, store, tenant, token, json))
      .then(() => {
        store.dispatch(setOkapiReady());
      });
  }
  return resp;
}

/**
 * checkOkapiSession
 * 1. Pull the session from local storage; if non-empty validate it, dispatching load-resources actions.
 * 2. Check if SSO (SAML) is enabled, dispatching check-sso actions
 * 3. dispatch set-okapi-ready.
 *
 * @param {*} okapiUrl
 * @param {*} store
 * @param {*} tenant
 */
export function checkOkapiSession(okapiUrl, store, tenant) {
  localforage.getItem('okapiSess')
    .then((sess) => {
      if (sess !== null) {
        return validateUser(okapiUrl, store, tenant, sess);
      }
    })
    .then(() => {
      getSSOEnabled(okapiUrl, store, tenant);
    })
    .finally(() => {
      store.dispatch(setOkapiReady());
    });
}

/**
 * requestLogin
 * authenticate with a username and password. return a promise that posts the values
 * and then processes the result to begin a session.
 * @param {*} okapiUrl
 * @param {*} store
 * @param {*} tenant
 * @param {*} data
 */
export function requestLogin(okapiUrl, store, tenant, data) {
  return fetch(`${okapiUrl}/bl-users/login?expandPermissions=true&fullPermissions=true`, {
    method: 'POST',
    headers: { 'X-Okapi-Tenant': tenant, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(resp => processOkapiSession(okapiUrl, store, tenant, resp));
}

/**
 * requestUserWithPerms
 * retrieve currently-authenticated user, then process the result to begin a session.
 * @param {*} okapiUrl
 * @param {*} store
 * @param {*} tenant
 * @param {*} token
 */
export function requestUserWithPerms(okapiUrl, store, tenant, token) {
  fetch(`${okapiUrl}/bl-users/_self?expandPermissions=true&fullPermissions=true`,
    { headers: getHeaders(tenant, token) })
    .then(resp => processOkapiSession(okapiUrl, store, tenant, resp, token));
}

/**
 * requestSSOLogin
 * authenticate via SSO/SAML
 * @param {*} okapiUrl
 * @param {*} tenant
 */
export function requestSSOLogin(okapiUrl, tenant) {
  const stripesUrl = (window.location.origin || `${window.location.protocol}//${window.location.host}`) + window.location.pathname;

  fetch(`${okapiUrl}/saml/login`, {
    method: 'POST',
    headers: { 'X-Okapi-tenant': tenant, 'Content-Type': 'application/json' },
    body: JSON.stringify({ stripesUrl }),
  })
    .then(resp => processSSOLoginResponse(resp));
}

/**
 * setCurServicePoint
 * 1. store the given service-point as the current one in locale storage,
 * 2. dispatch the current service-point
 * @param {} store
 * @param {*} servicePoint
 */
export function setCurServicePoint(store, servicePoint) {
  localforage.getItem('okapiSess').then((sess) => {
    sess.user.curServicePoint = servicePoint;
    localforage.setItem('okapiSess', sess);
    store.dispatch(setCurrentServicePoint(servicePoint));
  });
}

/**
 * setServicePoints
 * 1. store the given list in locale storage,
 * 2. dispatch the list of service-points
 * @param {} store
 * @param {*} servicePoint
 */
export function setServicePoints(store, servicePoints) {
  localforage.getItem('okapiSess').then((sess) => {
    sess.user.servicePoints = servicePoints;
    localforage.setItem('okapiSess', sess);
    store.dispatch(setUserServicePoints(servicePoints));
  });
}
