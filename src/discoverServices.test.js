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

// fetch error: resolve promise with ok: false
const mockFetchError = () => {
  global.fetch = jest.fn().mockImplementation(() => (
    Promise.resolve({
      ok: false,
      headers: new Map(),
      status: 400,
    })
  ));
};

// fetch failure: reject promise with $error
const mockFetchFail = (error) => {
  global.fetch = jest.fn().mockImplementation(() => Promise.reject(error));
};

// restore default fetch impl
const mockFetchCleanUp = () => {
  global.fetch.mockClear();
  delete global.fetch;
};

const TENANT_OPTIONS = {
  diku: {
    name: 'diku', clientId: 'diku-application'
  }
};

describe('discoverServices', () => {
  afterEach(() => {
    mockFetchCleanUp();
  });

  describe('okapi-based discovery', () => {
    const store = {
      getState: () => ({
        okapi: {
          url: 'https://url.com',
          token: 'frodo',
          tenant: 'elevenant'
        },
        config: {},
      }),
      dispatch: jest.fn(),
    };

    it('handles success', async () => {
      const version = '1.2.3';
      mockFetchSuccess(version);

      await discoverServices(store);
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_OKAPI', version });
      jest.clearAllMocks();
    });

    it('handles errors', async () => {
      mockFetchError();

      await discoverServices(store);
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_FAILURE', code: 400 });
      jest.clearAllMocks();
    });

    it('handles failures', async () => {
      const message = 'boom';

      mockFetchFail(message);

      await discoverServices(store);
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_FAILURE', message });
      jest.clearAllMocks();
    });
  });

  describe('eureka-based discovery', () => {
    const store = {
      getState: () => ({
        okapi: {
          url: 'https://url.com',
          token: 'frodo'
        },
        config: {
          tenantOptions: TENANT_OPTIONS,
        }
      }),
      dispatch: jest.fn(),
    };

    it('handles success', async () => {
      const version = '1.2.3';
      const data = {
        totalRecords: 123,
        applicationDescriptors: [{
          moduleDescriptors: [{ a: 'A' }],
          uiModuleDescriptors: [{ b: 'B' }],
          uiModules: [{ c: 'C' }],
        }],
      };

      globalThis.fetch = jest.fn();
      globalThis.fetch.mockImplementationOnce(() => (
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(data),
          text: () => Promise.resolve(data),
          headers: new Map(),
        })
      ));
      globalThis.fetch.mockImplementationOnce(() => (
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(version),
          text: () => Promise.resolve(version),
          headers: new Map(),
        })
      ));

      await discoverServices(store);
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_OKAPI', version });

      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_APPLICATIONS', data: data.applicationDescriptors[0] });

      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_INTERFACES', data: data.applicationDescriptors[0].moduleDescriptors[0] });
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_PERMISSION_DISPLAY_NAMES', data: data.applicationDescriptors[0].moduleDescriptors[0] });
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_PROVIDERS', data: data.applicationDescriptors[0].moduleDescriptors[0] });
    });

    it('throws when no records are present', async () => {
      const version = '1.2.3';
      const data = {};

      globalThis.fetch = jest.fn();
      globalThis.fetch.mockImplementationOnce(() => (
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(data),
          text: () => Promise.resolve(data),
          headers: new Map(),
        })
      ));
      globalThis.fetch.mockImplementationOnce(() => (
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(version),
          text: () => Promise.resolve(version),
          headers: new Map(),
        })
      ));

      await discoverServices(store);
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_OKAPI', version });
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_FAILURE', code: 200 });
    });


    it('handles errors', async () => {
      mockFetchError();

      await discoverServices(store);
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_FAILURE', code: 400 });
    });

    it('handles failures', async () => {
      const message = 'boom';

      mockFetchFail(message);

      await discoverServices(store);
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_FAILURE', message });
    });
  });
});

describe('discoveryReducer', () => {
  it('handles DISCOVERY_APPLICATIONS', () => {
    let state = {};
    const moduleDescriptors = [
      { id: 'mod-a', provides: [{ id: 'if-a', version: '1.0' }] },
      { id: 'mod-b' },
    ];
    const uiModules = [
      { id: 'folio_c' },
      { id: 'folio_d' },
    ];
    const action = {
      type: 'DISCOVERY_APPLICATIONS',
      data: {
        id: 'a',
        moduleDescriptors,
        uiModules,
      },
    };

    const mapped = {
      applications: {
        [action.data.id]: {
          name: action.data.id,
          modules: [
            ...moduleDescriptors.map((d) => (
              {
                name: d.id,
                interfaces: d.provides?.map((i) => {
                  return { name: i.id + ' ' + i.version };
                }) || []
              })),
            ...uiModules.map((d) => ({ name: d.id, interfaces: [] })),
          ],
        },
      },
    };

    state = discoveryReducer(state, action);

    expect(state).toMatchObject(mapped);
  });

  it('handles DISCOVERY_PERMISSION_DISPLAY_NAMES', () => {
    let state = {
      permissionDisplayNames: {}
    };
    const action = {
      type: 'DISCOVERY_PERMISSION_DISPLAY_NAMES',
      data: {
        permissionSets: [
          { 'permissionName': 'perm1', 'displayName': 'Admin Permission' },
          { 'permissionName': 'perm2', 'displayName': 'Read-only Permission' }
        ]
      },
    };

    state = discoveryReducer(state, action);

    expect(state.permissionDisplayNames.perm1).toBe(action.data.permissionSets[0].displayName);
    expect(state.permissionDisplayNames.perm2).toBe(action.data.permissionSets[1].displayName);
  });

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

