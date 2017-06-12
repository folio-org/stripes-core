/*
 * This function probes Okapi to discover what versions of what
 * interfaces are supported by the services that it is proxying
 * for. This information can be used to configure the UI at run-time
 * (e.g. not attempting to fetch loan information for a
 * non-circulating library that doesn't provide the circ interface)
 */
import 'isomorphic-fetch';

function discoverInterfaces(okapiUrl, store, entry) {
  fetch(`${okapiUrl}/_/proxy/modules/${entry.id}`)
    .catch((reason) => {
      store.dispatch({ type: 'DISCOVERY_FAILURE', message: reason });
    }).then((response) => {
      if (response.status >= 400) {
        store.dispatch({ type: 'DISCOVERY_FAILURE', code: response.status });
      } else {
        response.json().then((json) => {
          store.dispatch({ type: 'DISCOVERY_INTERFACES', data: json });
        });
      }
    });
}

export function discoverServices(okapiUrl, store) {
  fetch(`${okapiUrl}/_/version`)
    .catch((reason) => {
      store.dispatch({ type: 'DISCOVERY_FAILURE', message: reason });
    }).then((response) => {
      if (response.status >= 400) {
        store.dispatch({ type: 'DISCOVERY_FAILURE', code: response.status });
      } else {
        response.text().then((text) => {
          store.dispatch({ type: 'DISCOVERY_OKAPI', version: text });
        });
      }
    });

  fetch(`${okapiUrl}/_/proxy/modules`)
    .catch((reason) => {
      store.dispatch({ type: 'DISCOVERY_FAILURE', message: reason });
    }).then((response) => {
      if (response.status >= 400) {
        store.dispatch({ type: 'DISCOVERY_FAILURE', code: response.status });
      } else {
        response.json().then((json) => {
          store.dispatch({ type: 'DISCOVERY_SUCCESS', data: json });
          for (const entry of json) {
            discoverInterfaces(okapiUrl, store, entry);
          }
        });
      }
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
      for (const entry of action.data.provides) {
        interfaces[entry.id] = entry.version;
      }
      return Object.assign({}, state, {
        interfaces: Object.assign(state.interfaces || {}, interfaces),
      });
    }
    default:
      return state;
  }
}

export function isVersionCompatible(got, wanted) {
  const [gmajor, gminor] = got.split('.');
  const [wmajor, wminor] = wanted.split('.');
  return wmajor === gmajor && parseInt(wminor, 10) >= parseInt(gminor, 10);
}
