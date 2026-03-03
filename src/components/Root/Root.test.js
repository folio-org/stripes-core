import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import Root from './Root';
import { modulesInitialState } from '../../ModulesContext';

jest.mock('../../loginServices', () => ({
  loadTranslations: jest.fn(),
  checkOkapiSession: jest.fn(),
}));

jest.mock('./token-util', () => ({
  configureRtr: jest.fn().mockReturnValue({ rtr: true }),
  rotationHandler: jest.fn().mockReturnValue(() => { }),
  ResetTimer: class {
    constructor(callback, logger) {
      this.callback = callback;
      this.logger = logger;
    }

    reset() { }
    clear() { }
  },
}));
jest.mock('../SystemSkeleton', () => () => <div data-testid="system-skeleton">SystemSkeleton</div>);
jest.mock('../../createApolloClient', () => jest.fn().mockReturnValue({}));
jest.mock('../../createReactQueryClient', () => jest.fn().mockReturnValue({}));
jest.mock('@apollo/client', () => ({ ApolloProvider: ({ children }) => <>{children}</> }));
jest.mock('react-query', () => ({ QueryClientProvider: ({ children }) => <>{children}</> }));
jest.mock('@folio/stripes-components', () => ({ ErrorBoundary: ({ children }) => <>{children}</> }));

let latestContextFns = {};

jest.mock('../../RootWithIntl', () => {
  const { ConnectContext } = require('@folio/stripes-connect');
  return ({ stripes }) => (
    <ConnectContext.Consumer>
      {(val) => {
        latestContextFns = val; // capture addReducer/addEpic
        return (
          <div
            data-testid="root-with-intl"
            data-locale={stripes.locale}
          >
            RootWithIntl
          </div>
        );
      }}
    </ConnectContext.Consumer>
  );
});

const makeStore = (stateOverrides = {}) => {
  const state = {
    okapi: {
      bindings: {},
      currency: 'USD',
      currentPerms: {},
      currentUser: {},
      discovery: {},
      isAuthenticated: false,
      locale: 'en-US',
      okapiReady: false,
      plugins: {},
      serverDown: false,
      timezone: 'UTC',
      token: undefined,
      translations: undefined,
      withoutOkapi: false,
      ...stateOverrides.okapi,
    },
    discovery: stateOverrides.discovery || { isFinished: true },
    ...stateOverrides,
  };

  return {
    getState: () => state,
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  };
};

const getRootComponent = (props = {}) => (
  <Root
    store={makeStore()}
    logger={{}}
    epics={{ add: jest.fn() }}
    config={{ locale: 'en-US', rtr: { enabled: true } }}
    okapi={{ url: 'http://okapi', tenant: 'diku', withoutOkapi: false }}
    actionNames={[]}
    disableAuth
    defaultTranslations={{}}
    modules={{ app: [] }}
    history={{ location: { pathname: '/', search: '' } }}
    {...props}
  />
);

const renderRoot = (props = {}) => render(getRootComponent(props));

describe('Root component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latestContextFns = {};
  });

  it('shows server down message if serverDown state is true', () => {
    const store = makeStore({ okapi: { serverDown: true } });

    renderRoot({ store });

    expect(screen.getByText(/server is forbidden, unreachable or down/i)).toBeInTheDocument();
  });

  it('renders SystemSkeleton while translations not loaded', () => {
    const store = makeStore({ okapi: { translations: undefined } });

    renderRoot({ store });

    expect(screen.getByTestId('system-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('root-with-intl')).toBeNull();
  });

  describe('when user is logged in and reloading the page', () => {
    describe('and translations are loaded first', () => {
      describe('and modules are loaded second', () => {
        it('should display SystemSkeleton, otherwise will show login page flicker', () => {
          // Initial state - no translations, not authenticated, okapi not ready
          const initialStore = makeStore({
            okapi: {
              translations: undefined,
              okapiReady: false,
            }
          });

          const { rerender } = renderRoot({
            store: initialStore,
            modules: { app: [], settings: [] }
          });

          // Should show SystemSkeleton (no translations)
          expect(screen.getByTestId('system-skeleton')).toBeInTheDocument();
          expect(screen.queryByTestId('root-with-intl')).toBeNull();

          // Stage 1: Load translations first
          const stageOneState = {
            ...initialStore.getState(),
            okapi: {
              ...initialStore.getState().okapi,
              translations: { title: 'foo' },
            }
          };

          const stageOneStore = {
            ...initialStore,
            getState: () => stageOneState,
          };

          rerender(getRootComponent({
            store: stageOneStore,
            modules: { app: [], settings: [] }
          }));

          // Should show SystemSkeleton (okapiReady is still false)
          expect(screen.queryByTestId('root-with-intl')).toBeNull();
          expect(screen.getByTestId('system-skeleton')).toBeInTheDocument();

          // Stage 2: Load modules
          const stageTwoModules = {
            app: [
              { module: 'QueryMod', route: '/app1' },
            ],
            settings: []
          };

          rerender(getRootComponent({
            store: stageOneStore,
            modules: stageTwoModules
          }));

          // Should show SystemSkeleton (okapiReady is still false)
          expect(screen.queryByTestId('root-with-intl')).toBeNull();
          expect(screen.getByTestId('system-skeleton')).toBeInTheDocument();

          // Stage 3: Complete session validation (authenticate user and set okapiReady)
          const stageThreeState = {
            ...stageOneState,
            okapi: {
              ...stageOneState.okapi,
              okapiReady: true,
              currentUser: { id: 'user123', username: 'testuser' }
            }
          };

          const stageThreeStore = {
            ...initialStore,
            getState: () => stageThreeState,
          };

          rerender(getRootComponent({
            store: stageThreeStore,
            modules: stageTwoModules,
          }));

          // Should show RootWithIntl
          expect(screen.getByTestId('root-with-intl')).toBeInTheDocument();
          expect(screen.queryByTestId('system-skeleton')).toBeNull();
        });
      });
    });
  });

  it('addEpic only adds a new epic once', () => {
    const mockAdd = jest.fn();
    const epic = jest.fn();
    const store = makeStore({
      okapi: {
        okapiReady: true,
        translations: { title: 'Home' },
      },
    });

    renderRoot({
      epics: { add: mockAdd },
      store,
    });

    expect(latestContextFns.addEpic('epic1', epic)).toBe(true);
    expect(latestContextFns.addEpic('epic1', epic)).toBe(false);
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  it('updates queryResourceStateKey on modules change', () => {
    window.location.search = '?x=1';
    const store = makeStore();
    const initialModules = { app: [], settings: [] };

    const history = {
      location: { pathname: '/qm', search: '?x=1' },
    };

    const queryModule = {
      route: '/qm',
      queryResource: 'list',
      module: 'QueryMod',
    };

    const props = {
      store,
      history,
      modules: initialModules,
    };

    const { rerender } = renderRoot(props);

    const updatedState = {
      ...store.getState(),
      okapi: {
        ...store.getState().okapi,
        okapiReady: true,
        translations: { title: 'Home' },
      },
    };

    const updatedStore = {
      ...store,
      getState: () => updatedState,
    };

    rerender(getRootComponent({
      ...props,
      store: updatedStore,
      modules: {
        app: [queryModule],
        settings: [],
      },
    }));

    const passedReducer = jest.fn();
    const result = latestContextFns.addReducer('query_mod_list', passedReducer);

    expect(passedReducer).toHaveBeenCalledWith({ x: '1' }, expect.anything());
    expect(store.replaceReducer).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  describe('when modules are loading', () => {
    it('should render SystemSkeleton to avoid stripes-connect calling addReducer without modules on initial render', () => {
      const store = makeStore({
        okapi: {
          translations: { title: 'Home' },
          okapiReady: true,
        },
      });

      renderRoot({
        store,
        modules: modulesInitialState, // No modules yet
      });

      expect(screen.getByTestId('system-skeleton')).toBeInTheDocument();
    });
  });

  it('should call addReducer with query params from URL only when modules are loaded', () => {
    const search = '?query=test&filters=status.active';
    window.location.search = search;

    const queryModule = {
      route: '/users',
      queryResource: 'query',
      module: '@folio/users',
    };

    const history = {
      location: {
        pathname: '/users',
        search,
      },
    };

    // Initial render with okapiReady=true but NO modules yet
    const store = makeStore({
      okapi: {
        translations: { title: 'Home' },
        okapiReady: true, // Session check already complete
      },
    });

    const { rerender } = renderRoot({
      store,
      history,
      modules: modulesInitialState, // No modules yet
    });

    expect(screen.getByTestId('system-skeleton')).toBeInTheDocument();

    rerender(getRootComponent({
      store,
      history,
      modules: {
        app: [queryModule],
        settings: [],
      },
    }));

    const passedReducer = jest.fn();
    const result = latestContextFns.addReducer('folio_users_query', passedReducer);

    // The reducer should be initialized with the URL query parameters
    expect(passedReducer).toHaveBeenCalledWith(
      { query: 'test', filters: 'status.active' },
      expect.anything()
    );
    expect(store.replaceReducer).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
