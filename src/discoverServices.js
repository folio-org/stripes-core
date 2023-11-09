import { some } from 'lodash';

function getHeaders(tenant, token) {
  return {
    'X-Okapi-Tenant': tenant,
    'X-Okapi-Token': token,
    'Content-Type': 'application/json'
  };
}

function fetchOkapiVersion(store) {
  const okapi = store.getState().okapi;

  return fetch(`${okapi.url}/_/version`, {
    headers: getHeaders(okapi.tenant, okapi.token)
  }).then((response) => { // eslint-disable-line consistent-return
    if (response.status >= 400) {
      store.dispatch({ type: 'DISCOVERY_FAILURE', code: response.status });
      return response;
    } else {
      return response.text().then((text) => {
        store.dispatch({ type: 'DISCOVERY_OKAPI', version: text });
      });
    }
  }).catch((reason) => {
    store.dispatch({ type: 'DISCOVERY_FAILURE', message: reason });
  });
}

function fetchModules(store) {
  const okapi = store.getState().okapi;

  return fetch(`${okapi.url}/_/proxy/tenants/${okapi.tenant}/modules?full=true`, {
    headers: getHeaders(okapi.tenant, okapi.token)
  }).then((response) => { // eslint-disable-line consistent-return
    if (response.status >= 400) {
      store.dispatch({ type: 'DISCOVERY_FAILURE', code: response.status });
      return response;
    } else {
      return response.json().then((json) => {
        store.dispatch({ type: 'DISCOVERY_SUCCESS', data: json });
        return Promise.all(
          json.map(entry => Promise.all([
            store.dispatch({ type: 'DISCOVERY_INTERFACES', data: entry }),
            store.dispatch({ type: 'DISCOVERY_PROVIDERS', data: entry }),
          ]))
        );
      });
    }
  }).catch((reason) => {
    store.dispatch({ type: 'DISCOVERY_FAILURE', message: reason });
  });
}

/*
 * This function probes Okapi to discover what versions of what
 * interfaces are supported by the services that it is proxying
 * for. This information can be used to configure the UI at run-time
 * (e.g. not attempting to fetch loan information for a
 * non-circulating library that doesn't provide the circ interface)
 */
export function discoverServices(store) {
  const promises = [
    fetchOkapiVersion(store),
    fetchModules(store),
  ];

  return Promise.all(promises).then(() => {
    store.dispatch({ type: 'DISCOVERY_FINISHED' });
  });
}

export function discoveryReducer(state = {}, action) {
  switch (action.type) {
    case 'DISCOVERY_OKAPI':
      return Object.assign({}, state, { okapi: action.version });
    case 'DISCOVERY_FAILURE':
      return Object.assign({}, state, { failure: action });
    case 'DISCOVERY_SUCCESS': {
      const modules = {};
      for (const entry of action.data) {
        modules[entry.id] = entry.name;
      }
      return Object.assign({}, state, { modules });
    }
    case 'DISCOVERY_INTERFACES': {
      const interfaces = {};
      for (const entry of action.data.provides || []) {
        interfaces[entry.id] = entry.version;
      }
      return Object.assign({}, state, {
        interfaces: Object.assign(state.interfaces || {}, interfaces),
      });
    }
    case 'DISCOVERY_PROVIDERS': {
      if (action.data.provides?.length > 0) {
        return Object.assign({}, state, {
          interfaceProviders: [
            ...(state.interfaceProviders ?? []),
            {
              id: action.data.id,
              provides: action.data.provides.map(i => ({ id: i.id, version: i.version })),
            },
          ]
        });
      }

      return state;
    }
    case 'DISCOVERY_FINISHED': {
      return Object.assign({}, state, { isFinished: true });
    }
    default:
      return state;
  }
}

function isSingleVersionCompatible(got, wanted) {
  const [gmajor, gminor, gpatch] = got.split('.');
  const [wmajor, wminor, wpatch] = wanted.split('.');

  if (gmajor !== wmajor) return false;

  const gmint = parseInt(gminor, 10);
  const wmint = parseInt(wminor, 10);
  if (gmint < wmint) return false;
  if (gmint > wmint) return true;

  const gpint = parseInt(gpatch || '0', 10);
  const wpint = parseInt(wpatch || '0', 10);
  return gpint >= wpint;
}

export function isVersionCompatible(got, wanted) {
  return some(wanted.split(/\s+/), (w) => isSingleVersionCompatible(got, w));
}
