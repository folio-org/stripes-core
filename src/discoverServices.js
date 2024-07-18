import { some } from 'lodash';
import { config } from 'stripes-config';

function getHeaders(tenant, token) {
  return {
    'X-Okapi-Tenant': tenant,
    ...(token && { 'X-Okapi-Token': token }),
    'Content-Type': 'application/json'
  };
}

/**
 * parseApplicationDescriptor
 * Given an application descriptor, dispatch DISCOVERY_SUCCESS, then iterate
 * through the module descriptors and dispatch DISCOVERY_INTERFACES and
 * DISCOVERY_PROVIDERS for each one.
 *
 * @param {redux-store} store
 * @param {object} descriptor
 * @returns {Promise}
 */
function parseApplicationDescriptor(store, descriptor) {
  const list = [];

  const dispatchDescriptor = (d) => {
    return Promise.all([
      store.dispatch({ type: 'DISCOVERY_INTERFACES', data: d }),
      store.dispatch({ type: 'DISCOVERY_PERMISSION_DISPLAY_NAMES', data: d }),
      store.dispatch({ type: 'DISCOVERY_PROVIDERS', data: d }),
    ]);
  };

  const dispatchApplication = (application) => {
    return store.dispatch({
      type: 'DISCOVERY_APPLICATIONS',
      data: application,
    });
  };

  list.push(
    store.dispatch({
      type: 'DISCOVERY_SUCCESS',
      data: descriptor.moduleDescriptors,
    })
  );

  if (descriptor.moduleDescriptors) {
    list.push(...descriptor.moduleDescriptors.map((i) => dispatchDescriptor(i)));
  }

  if (descriptor.uiModuleDescriptors) {
    list.push(...descriptor.uiModuleDescriptors.map((i) => dispatchDescriptor(i)));
  }

  if (descriptor.uiModules) {
    list.push(...descriptor.uiModules.map((i) => dispatchDescriptor(i)));
  }

  list.push(dispatchApplication(descriptor));

  return Promise.all(list);
}

/**
 * fetchApplicationDetails
 * Retrieve applications and dispatch disovery actions.
 *
 * Given a list of entitlements for a tenant, retrieve the corresponding
 * application descriptors and dispatch DISCOVERY_SUCCESS. For each application,
 * dispatch DISCOVERY_INTERFACES and DISOVERY_PROVIDERS.
 *
 * The response is shaped like
 * {
    "applicationDescriptors": [
      {
        "description": "Minimal FOLIO platform installation.",
        "id": "app-platform-minimal-0.0.1",
        "name": "app-platform-minimal",
        "platform": "base",
        "version": "0.0.1",
        "modules": [
          { "id": "mod-users-18.2.0", "name": "mod-users", "version": "18.2.0" },
          ...
        ],
        "uiModules": [
          { "name": "folio_stripes-core", "version": "8.1.2" },
          ...
        ],
        "moduleDescriptors": [
          { ... },
          ...
        ]
      },
      ...
    ],
    "totalRecords": 1
 * }
 *
 * @param {redux-store} store
 */

const APP_MAX_COUNT = 500;

function fetchApplicationDetails(store) {
  const { okapi } = store.getState();

  return fetch(`${okapi.url}/entitlements/${okapi.tenant}/applications?limit=${APP_MAX_COUNT}`, {
    credentials: 'include',
    headers: getHeaders(okapi.tenant, okapi.token),
    mode: 'cors',
  })
    .then((response) => {
      if (response.ok) {
        return response.json().then((json) => {
          if (json.totalRecords > 0) {
            const list = [];
            json.applicationDescriptors.forEach((i) => {
              list.push(parseApplicationDescriptor(store, i));
            });
            return Promise.all(list);
          }

          // eslint-disable-next-line no-console
          console.error(`>>> NO APPLICATIONS AVAILABLE FOR ${okapi.tenant}`, json);
          store.dispatch({ type: 'DISCOVERY_FAILURE', code: response.status });
          throw response;
        });
      } else {
        // eslint-disable-next-line no-console
        console.error(`>>> COULD NOT RETRIEVE APPLICATIONS FOR ${okapi.tenant}`, response);
        store.dispatch({ type: 'DISCOVERY_FAILURE', code: response.status });
        throw response;
      }
    })
    .catch(reason => {
      // eslint-disable-next-line no-console
      console.error(`@@ COULD NOT RETRIEVE APPLICATIONS FOR ${okapi.tenant}`, reason);
      store.dispatch({ type: 'DISCOVERY_FAILURE', message: reason });
    });
}

/**
 * discoverServices
 * This function probes Okapi to discover what versions of what
 * interfaces are supported by the services that it is proxying
 * for. This information can be used to configure the UI at run-time
 * (e.g. not attempting to fetch loan information for a
 * non-circulating library that doesn't provide the circ interface)
 *
 * @param {redux-store} store
 * @returns Promise
 */

function fetchGatewayVersion(store) {
  const { okapi } = store.getState();

  return fetch(`${okapi.url}/version`, {
    credentials: 'include',
    headers: getHeaders(okapi.tenant, okapi.token),
    mode: 'cors',
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

function fetchOkapiVersion(store) {
  const { okapi } = store.getState();

  return fetch(`${okapi.url}/_/version`, {
    credentials: 'include',
    headers: getHeaders(okapi.tenant, okapi.token),
    mode: 'cors',
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
  const { okapi } = store.getState();

  return fetch(`${okapi.url}/_/proxy/tenants/${okapi.tenant}/modules?full=true`, {
    credentials: 'include',
    headers: getHeaders(okapi.tenant, okapi.token),
    mode: 'cors',
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
  const promises = [];
  if (config.tenantOptions) {
    promises.push(fetchApplicationDetails(store));
    promises.push(fetchGatewayVersion(store));
  } else {
    promises.push(fetchOkapiVersion(store));
    promises.push(fetchModules(store));
  }

  return Promise.all(promises).then(() => {
    store.dispatch({ type: 'DISCOVERY_FINISHED' });
  });
}


export function discoveryReducer(state = {}, action) {
  switch (action.type) {
    case 'DISCOVERY_APPLICATIONS':
      return {
        ...state,
        applications: {
          ...state.applications,
          [action.data.id]: {
            name: action.data.id,
            modules: [
              ...action.data.moduleDescriptors.map((d) => {
                return {
                  name: d.id,
                  interfaces: d.provides?.map((i) => {
                    return { name: i.id + ' ' + i.version };
                  }) || [],
                };
              }),
              ...action.data.uiModules.map((d) => {
                return {
                  name: d.id,
                  interfaces: [],
                };
              })

            ],
          },
        },
      };
    case 'DISCOVERY_OKAPI':
      return Object.assign({}, state, { okapi: action.version });
    case 'DISCOVERY_FAILURE':
      return Object.assign({}, state, { failure: action });
    case 'DISCOVERY_SUCCESS': {
      const modules = { ...state.modules };
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
    case 'DISCOVERY_PERMISSION_DISPLAY_NAMES': {
      const permissions = {};
      for (const entry of action.data.permissionSets || []) {
        permissions[entry.permissionName] = entry.displayName;
      }
      return { permissionDisplayNames: { ...state.permissionDisplayNames, ...permissions } };
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
