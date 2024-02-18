import {
  discoverServices,
  discoveryReducer,
  isVersionCompatible,
} from './discoverServices';

// fetch success: resolve promise with ok == true and $data in json()
const mockFetchSuccess = (data) => {
  global.fetch = jest.fn().mockImplementation(() => (
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(data),
      headers: new Map(),
    })
  ));
};

// fetch failure: reject promise with $error
const mockFetchError = () => {
  global.fetch = jest.fn().mockImplementation(() => (
    Promise.resolve({
      ok: false,
      headers: new Map(),
      status: 400,
    })
  ));
};

const mockFetchFail = (error) => {
  global.fetch = jest.fn().mockImplementation(() => Promise.reject(error));
};

// restore default fetch impl
const mockFetchCleanUp = () => {
  global.fetch.mockClear();
  delete global.fetch;
};

describe('discoverServices', () => {
  afterEach(() => {
    mockFetchCleanUp();
  });

  describe('fetchOkapiVersion', () => {
    it('handles success', async () => {
      const store = {
        getState: () => ({
          okapi: {
            url: 'https://url.com',
            token: 'frodo'
          },
        }),
        dispatch: jest.fn(),
      };

      const version = '1.2.3';
      mockFetchSuccess(version);
      discoverServices(store);

      await discoverServices(store);
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_OKAPI', version });
    });
  });

  it('handles errors', async () => {
    const store = {
      getState: () => ({
        okapi: { url: 'https://url.com' },
      }),
      dispatch: jest.fn(),
    };

    mockFetchError();
    discoverServices(store);

    await discoverServices(store);
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_FAILURE', code: 400 });
  });

  it('handles failures', async () => {
    const store = {
      getState: () => ({
        okapi: { url: 'https://url.com' },
      }),
      dispatch: jest.fn(),
    };

    const message = 'boom';

    mockFetchFail(message);
    discoverServices(store);

    await discoverServices(store)
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_FAILURE', message });
  });
});

describe('discoveryReducer', () => {
  it('handles DISCOVERY_OKAPI', () => {
    let state = {
      okapi: '0.0.0'
    };
    const action = {
      type: 'DISCOVERY_OKAPI',
      version: '1.2.3',
    };

    state = discoveryReducer(state, action);

    expect(state.okapi).toBe(action.version);
  });

  it('handles DISCOVERY_FAILURE', () => {
    let state = {};
    const action = {
      type: 'DISCOVERY_FAILURE',
      message: 'it exploded',
    };

    state = discoveryReducer(state, action);

    expect(state.failure).toMatchObject(action);
  });

  it('handles DISCOVERY_SUCCESS', () => {
    let state = {};
    const action = {
      type: 'DISCOVERY_SUCCESS',
      data: [
        { id: 'a', name: 'alpha' },
        { id: 'b', name: 'beta' },
        { id: 'g', name: 'gamma' },
      ],
    };

    const mapped = {};
    action.data.forEach(i => {
      mapped[i.id] = i.name;
    });

    state = discoveryReducer(state, action);

    expect(state.modules).toMatchObject(mapped);
  });

  it('handles DISCOVERY_INTERFACES', () => {
    let state = {};
    const action = {
      type: 'DISCOVERY_INTERFACES',
      data: {
        provides: [
          { id: 'a', version: '1.1' },
          { id: 'b', version: '2.2' },
          { id: 'g', version: '3.3' },
        ],
      }
    };

    const mapped = {};
    action.data.provides.forEach(i => {
      mapped[i.id] = i.version;
    });

    state = discoveryReducer(state, action);

    expect(state.interfaces).toMatchObject(mapped);
  });

  it('handles empty DISCOVERY_INTERFACES', () => {
    let state = {};
    const action = {
      type: 'DISCOVERY_INTERFACES',
      data: {}
    };

    state = discoveryReducer(state, action);

    expect(state.interfaces).toMatchObject({});
  });

  it('handles DISCOVERY_PROVIDERS', () => {
    let state = {};
    const action = {
      type: 'DISCOVERY_PROVIDERS',
      data: {
        id: 'monkey',
        provides: [
          { id: 'a', version: '1.1' },
          { id: 'b', version: '2.2' },
          { id: 'g', version: '3.3' },
        ],
      },
    };

    const mapped = {
      id: action.data.id,
      provides: action.data.provides.map(j => ({ id: j.id, version: j.version })),
    };

    state = discoveryReducer(state, action);

    expect(state.interfaceProviders[0]).toMatchObject(mapped);
  });

  it('handles empty DISCOVERY_PROVIDERS', () => {
    let state = {};
    const action = {
      type: 'DISCOVERY_PROVIDERS',
      data: {
        id: 'monkey',
      },
    };

    state = discoveryReducer(state, action);

    expect(state).toMatchObject({});
  });

  it('handles DISCOVERY_FINISHED', () => {
    let state = {
      isFinished: false,
    };
    const action = {
      type: 'DISCOVERY_FINISHED',
    };

    state = discoveryReducer(state, action);

    expect(state.isFinished).toBe(true);
  });

  it('passes state through for other actions', () => {
    let state = {
      monkey: 'bagel'
    };
    const action = {
      type: 'THUNDER_CHICKEN',
    };

    state = discoveryReducer(state, action);

    expect(state).toMatchObject(state);
  });
});


describe('isVersionCompatible', () => {
  it('rejects incompatible majors', () => {
    expect(isVersionCompatible('1.0', '2.0')).toBe(false);
  });

  it('rejects incompatible minors', () => {
    expect(isVersionCompatible('2.0', '2.1')).toBe(false);
  });

  it('rejects incompatible patches', () => {
    expect(isVersionCompatible('3.0.0', '3.0.1')).toBe(false);
  });

  it('accepts compatible majors', () => {
    expect(isVersionCompatible('1', '1')).toBe(true);
  });

  it('accepts compatible minors', () => {
    expect(isVersionCompatible('2.2', '2.1')).toBe(true);
  });

  it('accepts compatible patches', () => {
    expect(isVersionCompatible('3.0.1', '3.0.0')).toBe(true);
  });
});
// function getHeaders(tenant, token) {
//   return {
//     'X-Okapi-Tenant': tenant,
//     ...(token && { 'X-Okapi-Token': token }),
//     'Content-Type': 'application/json'
//   };
// }

// function fetchOkapiVersion(store) {
//   const okapi = store.getState().okapi;

//   return fetch(`${okapi.url}/_/version`, {
//     headers: getHeaders(okapi.tenant, okapi.token),
//     credentials: 'include',
//     mode: 'cors',
//   }).then((response) => { // eslint-disable-line consistent-return
//     if (response.status >= 400) {
//       store.dispatch({ type: 'DISCOVERY_FAILURE', code: response.status });
//       return response;
//     } else {
//       return response.text().then((text) => {
//         store.dispatch({ type: 'DISCOVERY_OKAPI', version: text });
//       });
//     }
//   }).catch((reason) => {
//     store.dispatch({ type: 'DISCOVERY_FAILURE', message: reason });
//   });
// }

// function fetchModules(store) {
//   const okapi = store.getState().okapi;

//   return fetch(`${okapi.url}/_/proxy/tenants/${okapi.tenant}/modules?full=true`, {
//     headers: getHeaders(okapi.tenant, okapi.token),
//     credentials: 'include',
//     mode: 'cors',
//   }).then((response) => { // eslint-disable-line consistent-return
//     if (response.status >= 400) {
//       store.dispatch({ type: 'DISCOVERY_FAILURE', code: response.status });
//       return response;
//     } else {
//       return response.json().then((json) => {
//         store.dispatch({ type: 'DISCOVERY_SUCCESS', data: json });
//         return Promise.all(
//           json.map(entry => Promise.all([
//             store.dispatch({ type: 'DISCOVERY_INTERFACES', data: entry }),
//             store.dispatch({ type: 'DISCOVERY_PROVIDERS', data: entry }),
//           ]))
//         );
//       });
//     }
//   }).catch((reason) => {
//     store.dispatch({ type: 'DISCOVERY_FAILURE', message: reason });
//   });
// }

/*
 * This function probes Okapi to discover what versions of what
 * interfaces are supported by the services that it is proxying
 * for. This information can be used to configure the UI at run-time
 * (e.g. not attempting to fetch loan information for a
 * non-circulating library that doesn't provide the circ interface)
 */
// export function discoverServices(store) {
//   const promises = [
//     fetchOkapiVersion(store),
//     fetchModules(store),
//   ];

//   return Promise.all(promises).then(() => {
//     store.dispatch({ type: 'DISCOVERY_FINISHED' });
//   });
// }

// export function discoveryReducer(state = {}, action) {
//   switch (action.type) {
//     case 'DISCOVERY_OKAPI':
//       return Object.assign({}, state, { okapi: action.version });
//     case 'DISCOVERY_FAILURE':
//       return Object.assign({}, state, { failure: action });
//     case 'DISCOVERY_SUCCESS': {
//       const modules = {};
//       for (const entry of action.data) {
//         modules[entry.id] = entry.name;
//       }
//       return Object.assign({}, state, { modules });
//     }
//     case 'DISCOVERY_INTERFACES': {
//       const interfaces = {};
//       for (const entry of action.data.provides || []) {
//         interfaces[entry.id] = entry.version;
//       }
//       return Object.assign({}, state, {
//         interfaces: Object.assign(state.interfaces || {}, interfaces),
//       });
//     }
//     case 'DISCOVERY_PROVIDERS': {
//       if (action.data.provides?.length > 0) {
//         return Object.assign({}, state, {
//           interfaceProviders: [
//             ...(state.interfaceProviders ?? []),
//             {
//               id: action.data.id,
//               provides: action.data.provides.map(i => ({ id: i.id, version: i.version })),
//             },
//           ]
//         });
//       }

//       return state;
//     }
//     case 'DISCOVERY_FINISHED': {
//       return Object.assign({}, state, { isFinished: true });
//     }
//     default:
//       return state;
//   }
// }

// function isSingleVersionCompatible(got, wanted) {
//   const [gmajor, gminor, gpatch] = got.split('.');
//   const [wmajor, wminor, wpatch] = wanted.split('.');

//   if (gmajor !== wmajor) return false;

//   const gmint = parseInt(gminor, 10);
//   const wmint = parseInt(wminor, 10);
//   if (gmint < wmint) return false;
//   if (gmint > wmint) return true;

//   const gpint = parseInt(gpatch || '0', 10);
//   const wpint = parseInt(wpatch || '0', 10);
//   return gpint >= wpint;
// }

// export function isVersionCompatible(got, wanted) {
//   return some(wanted.split(/\s+/), (w) => isSingleVersionCompatible(got, w));
// }
