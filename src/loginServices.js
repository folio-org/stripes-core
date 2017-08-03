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

function createOkapiSession(okapiUrl, store, tenant, response) {
  const token = response.headers.get('X-Okapi-Token');
  store.dispatch(setOkapiToken(token));
  store.dispatch(clearAuthFailure());
  response.json().then((json) => {
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
export function validateUser(okapiUrl, store, tenant, session) {
  fetch(`${okapiUrl}/users`, { headers: getHeaders(store, tenant, session.token) }).then((response) => {
    if (response.status >= 400) {
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

export function checkUser(okapiUrl, store, tenant) {
  localforage.getItem('okapiSess').then((sess) => {
    if (sess !== null) {
      validateUser(okapiUrl, store, tenant, sess);
    }
  });
}

export function requestLogin(okapiUrl, store, tenant, data, initialValues) {
  fetch(`${okapiUrl}/bl-users/login?expandPermissions=true&fullPermissions=true`, {
    method: 'POST',
    headers: { 'X-Okapi-Tenant': tenant, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((response) => {
    if (response.status >= 400) {
      clearOkapiSession(store);
      // eslint-disable-next-line no-param-reassign
      initialValues.username = data.username;
    } else {
      createOkapiSession(okapiUrl, store, tenant, response);
    }
  });
}

export function findUserById(okapiUrl, store, tenant, token, userId) {
  fetch(`${okapiUrl}/bl-users/by-id/${userId}`,
    { headers: getHeaders(store, tenant, token) })
  .then((response) => {
    if (response.status >= 400) {
      clearOkapiSession(store);
    } else {
      createOkapiSession(okapiUrl, store, tenant, response);
    }
  });
}
