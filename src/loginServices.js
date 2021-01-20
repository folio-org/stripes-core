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
  'ar',
  'zh-CN',
  'zh-TW',
  'da-DK',
  'en-GB',
  'en-SE',
  'en-US',
  'fr-FR',
  'de-DE',
  'he',
  'hi-IN',
  'hu-HU',
  'ja',
  'ko',
  'it-IT',
  'nb',
  'nn',
  'pl',
  'pt-BR',
  'pt-PT',
  'ru',
  'es',
  'es-419',
  'es-ES',
  'sv',
  'ur',
];

function getHeaders(tenant, token) {
  return {
    'X-Okapi-Tenant': tenant,
    'X-Okapi-Token': token,
    'Content-Type': 'application/json',
  };
}

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

export function getLocale(okapiUrl, store, tenant) {
  fetch(`${okapiUrl}/configurations/entries?query=(module=ORG and configName=localeSettings)`,
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
    });
}

export function getPlugins(okapiUrl, store, tenant) {
  fetch(`${okapiUrl}/configurations/entries?query=(module=PLUGINS)`,
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
    });
}

export function getBindings(okapiUrl, store, tenant) {
  fetch(`${okapiUrl}/configurations/entries?query=(module=ORG and configName=bindings)`,
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
      store.dispatch(setOkapiReady());
    });
}

function loadResources(okapiUrl, store, tenant) {
  getLocale(okapiUrl, store, tenant);
  getPlugins(okapiUrl, store, tenant);
  getBindings(okapiUrl, store, tenant);
  if (!store.getState().okapi.withoutOkapi) discoverServices(store);
}

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

  // You are not expected to understand this
  // ...then aren't you expected to explain it?
  const perms = Object.assign({}, ...data.permissions.permissions.map(p => ({ [p.permissionName]: true })));
  store.dispatch(setCurrentPerms(perms));
  const okapiSess = {
    token,
    user,
    perms,
  };
  localforage.setItem('okapiSess', okapiSess);
  store.dispatch(setSessionData(okapiSess));

  loadResources(okapiUrl, store, tenant);
}

// Validate stored token by attempting to fetch /bl-users/_self
function validateUser(okapiUrl, store, tenant, session) {
  fetch(`${okapiUrl}/bl-users/_self`, { headers: getHeaders(tenant, session.token) }).then((resp) => {
    if (resp.status >= 400) {
      store.dispatch(clearCurrentUser());
      store.dispatch(clearOkapiToken());
      store.dispatch(setOkapiReady());
      localforage.removeItem('okapiSess');
    } else {
      const { token, user, perms } = session;
      store.dispatch(setSessionData({ token, user, perms }));
      loadResources(okapiUrl, store, tenant);
    }
  }).catch(() => {
    store.dispatch(setServerDown());
  });
}

function isSSOEnabled(okapiUrl, store, tenant) {
  fetch(`${okapiUrl}/saml/check`, { headers: { 'X-Okapi-Tenant': tenant, 'Accept': 'application/json' } })
    .then((response) => {
      if (response.status >= 400) {
        store.dispatch(checkSSO(false));
      } else {
        response.json().then((json) => {
          store.dispatch(checkSSO(json.active));
        });
      }
      store.dispatch(setOkapiReady());
    })
    .catch(() => {
      store.dispatch(checkSSO(false));
      store.dispatch(setOkapiReady());
    });
}

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

function processOkapiSession(okapiUrl, store, tenant, resp, ssoToken) {
  const token = resp.headers.get('X-Okapi-Token') || ssoToken;
  const { dispatch } = store;

  if (resp.status >= 400) {
    handleLoginError(dispatch, resp);
  } else {
    resp.json().then(json => createOkapiSession(okapiUrl, store, tenant, token, json));
  }
  return resp;
}

export function checkOkapiSession(okapiUrl, store, tenant) {
  localforage.getItem('okapiSess').then((sess) => {
    if (sess !== null) {
      validateUser(okapiUrl, store, tenant, sess);
    } else {
      isSSOEnabled(okapiUrl, store, tenant);
    }
  });
}

export function requestLogin(okapiUrl, store, tenant, data) {
  return fetch(`${okapiUrl}/bl-users/login?expandPermissions=true&fullPermissions=true`, {
    method: 'POST',
    headers: { 'X-Okapi-Tenant': tenant, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(resp => processOkapiSession(okapiUrl, store, tenant, resp));
}

export function requestUserWithPerms(okapiUrl, store, tenant, token) {
  fetch(`${okapiUrl}/bl-users/_self?expandPermissions=true&fullPermissions=true`,
    { headers: getHeaders(tenant, token) })
    .then(resp => processOkapiSession(okapiUrl, store, tenant, resp, token));
}

export function requestSSOLogin(okapiUrl, tenant) {
  const stripesUrl = (window.location.origin || `${window.location.protocol}//${window.location.host}`) + window.location.pathname;

  fetch(`${okapiUrl}/saml/login`, {
    method: 'POST',
    headers: { 'X-Okapi-tenant': tenant, 'Content-Type': 'application/json' },
    body: JSON.stringify({ stripesUrl }),
  })
    .then(resp => processSSOLoginResponse(resp));
}

export function setCurServicePoint(store, servicePoint) {
  localforage.getItem('okapiSess').then((sess) => {
    sess.user.curServicePoint = servicePoint;
    localforage.setItem('okapiSess', sess);
    store.dispatch(setCurrentServicePoint(servicePoint));
  });
}

export function setServicePoints(store, servicePoints) {
  localforage.getItem('okapiSess').then((sess) => {
    sess.user.servicePoints = servicePoints;
    localforage.setItem('okapiSess', sess);
    store.dispatch(setUserServicePoints(servicePoints));
  });
}
