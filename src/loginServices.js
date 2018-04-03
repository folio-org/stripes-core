import _ from 'lodash';
import 'isomorphic-fetch';
import localforage from 'localforage';
import { change } from 'redux-form';
import { addLocaleData } from 'react-intl';
import { modules, translations } from 'stripes-config'; // eslint-disable-line

import {
  setCurrentUser,
  clearCurrentUser,
  setCurrentPerms,
  setLocale,
  setTimezone,
  setPlugins,
  setBindings,
  setOkapiToken,
  setTranslations,
  clearOkapiToken,
  setAuthError,
  checkSSO,
  setOkapiReady,
  setServerDown,
} from './okapiActions';

function getHeaders(tenant, token) {
  return {
    'X-Okapi-Tenant': tenant,
    'X-Okapi-Token': token,
    'Content-Type': 'application/json',
  };
}

export function loadTranslations(store, locale) {
  const parentLocale = locale.split('-')[0];
  return import(`react-intl/locale-data/${parentLocale}`)
    .then(intlData => addLocaleData(intlData))
    .then(() => fetch(translations[parentLocale]))
    .then((response) => {
      if (response.ok) {
        response.json().then((stripesTranslations) => {
          store.dispatch(setTranslations(stripesTranslations));
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
            const { locale, timezone } = localeValues;
            if (locale) loadTranslations(store, locale);
            if (timezone) store.dispatch(setTimezone(timezone));
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

function clearOkapiSession(store, resp) {
  resp.json().then((json) => {
    localforage.removeItem('okapiSess');
    store.dispatch(change('login', 'password', ''));
    // This is a lame way to detect the nature of the error. In future, the response status will be a 4xx
    if (resp.status === 500 && json.errorMessage.startsWith('Error verifying user existence')) {
      store.dispatch(setAuthError('Sorry, the information entered does not match our records.'));
    } else {
      store.dispatch(setAuthError(`Error ${resp.status} ${resp.statusText}: ${json.errorMessage}`));
    }
    store.dispatch(setOkapiReady());
  });
}

function createOkapiSession(okapiUrl, store, tenant, token, data) {
  store.dispatch(setOkapiToken(token));
  store.dispatch(setAuthError(null));
  store.dispatch(setCurrentUser(data.user.personal));

  // You are not expected to understand this
  // ...then aren't you expected to explain it?
  const perms = Object.assign({}, ...data.permissions.permissions.map(p => ({ [p.permissionName]: true })));
  store.dispatch(setCurrentPerms(perms));
  const okapiSess = {
    token,
    user: data.user.personal,
    perms,
  };
  localforage.setItem('okapiSess', okapiSess);
  getLocale(okapiUrl, store, tenant);
  getPlugins(okapiUrl, store, tenant);
  getBindings(okapiUrl, store, tenant);
}

// Validate stored token by attempting to fetch /users
function validateUser(okapiUrl, store, tenant, session) {
  fetch(`${okapiUrl}/users`, { headers: getHeaders(tenant, session.token) }).then((resp) => {
    if (resp.status >= 400) {
      store.dispatch(clearCurrentUser());
      store.dispatch(clearOkapiToken());
      store.dispatch(setOkapiReady());
      localforage.removeItem('okapiSess');
    } else {
      store.dispatch(setOkapiToken(session.token));
      store.dispatch(setCurrentUser(session.user));
      store.dispatch(setCurrentPerms(session.perms));
      getLocale(okapiUrl, store, tenant);
      getPlugins(okapiUrl, store, tenant);
      getBindings(okapiUrl, store, tenant);
    }
  }).catch(() => {
    store.dispatch(setServerDown());
  });
}

const validateUserDep = _.debounce(validateUser, 5000, { leading: true, trailing: false });

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
    });
}

const isSSOEnabledDep = _.debounce(isSSOEnabled, 5000, { leading: true, trailing: false });

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

function processOkapiSession(okapiUrl, store, tenant, resp) {
  const token = resp.headers.get('X-Okapi-Token');
  if (resp.status >= 400) {
    clearOkapiSession(store, resp);
  } else {
    resp.json().then(json =>
      createOkapiSession(okapiUrl, store, tenant, token, json));
  }
  return resp;
}

export function checkOkapiSession(okapiUrl, store, tenant) {
  localforage.getItem('okapiSess').then((sess) => {
    if (sess !== null) {
      validateUserDep(okapiUrl, store, tenant, sess);
    } else {
      isSSOEnabledDep(okapiUrl, store, tenant);
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
    .then(resp => processOkapiSession(okapiUrl, store, tenant, resp));
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
