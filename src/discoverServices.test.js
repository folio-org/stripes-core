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

    await discoverServices(store);
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'DISCOVERY_FAILURE', message });
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

