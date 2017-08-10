import _ from 'lodash';
import 'isomorphic-fetch';
import localforage from 'localforage';
import { reset } from 'redux-form';

import {
  setCurrentUser,
  clearCurrentUser,
  setCurrentPerms,
  setLocale,
  setPlugins,
  setBindings,
  setOkapiToken,
  clearOkapiToken,
  authFailure,
  clearAuthFailure,
  checkSSO,
} from './okapiActions';

function getHeaders(store, tenant, token) {
  return {
    'X-Okapi-Tenant': tenant,
    'X-Okapi-Token': token,
    'Content-Type': 'application/json',
  };
}

export function getLocale(okapiUrl, store, tenant) {
  fetch(`${okapiUrl}/configurations/entries?query=(module=ORG and configName=locale)`,
    { headers: getHeaders(store, tenant, store.getState().okapi.token) })
  .then((response) => {
    let locale = 'en-US';
    if (response.status >= 400) {
      store.dispatch(setLocale(locale));
    } else {
      response.json().then((json) => {
        const configs = json.configs;
        if (configs.length > 0) locale = configs[0].value;
        store.dispatch(setLocale(locale));
      });
    }
  });
}

export function getPlugins(okapiUrl, store, tenant) {
  fetch(`${okapiUrl}/configurations/entries?query=(module=PLUGINS)`,
    { headers: getHeaders(store, tenant, store.getState().okapi.token) })
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
    { headers: getHeaders(store, tenant, store.getState().okapi.token) })
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
  });
}

function clearOkapiSession(store) {
  store.dispatch(clearCurrentUser());
  store.dispatch(clearOkapiToken());
  localforage.removeItem('okapiSess');
  store.dispatch(reset('login'));
  store.dispatch(authFailure());
}

function createOkapiSession(okapiUrl, store, tenant, resp) {
  const token = resp.headers.get('X-Okapi-Token');
  store.dispatch(setOkapiToken(token));
  store.dispatch(clearAuthFailure());
  resp.json().then((json) => {
    store.dispatch(setCurrentUser(json.user.personal));
    // You are not expected to understand this
    // ...then aren't you expected to explain it?
    const perms = Object.assign({}, ...json.permissions.permissions.map(p => ({ [p.permissionName]: true })));
    store.dispatch(setCurrentPerms(perms));
    const okapiSess = {
      token,
      user: json.user.personal,
      perms,
    };
    localforage.setItem('okapiSess', okapiSess);
  });
  getLocale(okapiUrl, store, tenant);
  getPlugins(okapiUrl, store, tenant);
  getBindings(okapiUrl, store, tenant);
}

// Validate stored token by attempting to fetch /users
function validateUser(okapiUrl, store, tenant, session) {
  fetch(`${okapiUrl}/users`, { headers: getHeaders(store, tenant, session.token) }).then((resp) => {
    if (resp.status >= 400) {
      store.dispatch(clearCurrentUser());
      store.dispatch(clearOkapiToken());
      localforage.removeItem('okapiSess');
    } else {
      store.dispatch(setOkapiToken(session.token));
      store.dispatch(setCurrentUser(session.user));
      store.dispatch(setCurrentPerms(session.perms));
      getLocale(okapiUrl, store, tenant);
      getPlugins(okapiUrl, store, tenant);
      getBindings(okapiUrl, store, tenant);
    }
  });
}

const validateUserDep = _.debounce(validateUser, 5000, { leading: true, trailing: false });

export function checkUser(okapiUrl, store, tenant) {
  localforage.getItem('okapiSess').then((sess) => {
    if (sess !== null) {
      validateUserDep(okapiUrl, store, tenant, sess);
    }
  });
}

function isSSO(okapiUrl, store, tenant) {
  fetch(`${okapiUrl}/saml/check`, { headers: { 'X-Okapi-Tenant': tenant } })
  .then((response) => {
    if (response.status >= 400) {
      store.dispatch(checkSSO(false));
    } else {
      response.json(json => store.dispatch(checkSSO(json)));
    }
  });
}

const isSSODep = _.debounce(isSSO, 5000, { leading: true, trailing: false });

export function isSSOEnabled(okapiUrl, store, tenant) {
  return isSSODep(okapiUrl, store, tenant);
}

export function requestLogin(okapiUrl, store, tenant, data) {
  return fetch(`${okapiUrl}/bl-users/login?expandPermissions=true&fullPermissions=true`, {
    method: 'POST',
    headers: { 'X-Okapi-Tenant': tenant, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((resp) => {
    if (resp.status >= 400) {
      clearOkapiSession(store);
    } else {
      createOkapiSession(okapiUrl, store, tenant, resp);
    }

    return resp;
  });
}

export function requestUserWithPerms(okapiUrl, store, tenant, token, userId) {
  fetch(`${okapiUrl}/bl-users/by-id/${userId}?expandPermissions=true&fullPermissions=true`,
    { headers: getHeaders(store, tenant, token) })
  .then((resp) => {
    if (resp.status >= 400) {
      clearOkapiSession(store);
    } else {
      createOkapiSession(okapiUrl, store, tenant, resp);
    }
  });
}
