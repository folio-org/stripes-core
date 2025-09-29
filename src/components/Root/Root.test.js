import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import Root from './Root';

jest.mock('../../loginServices', () => ({
  loadTranslations: jest.fn(),
  checkOkapiSession: jest.fn(),
}));

jest.mock('./token-util', () => ({ configureRtr: jest.fn().mockReturnValue({ rtr: true }) }));
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
      translations: { ready: true },
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

  it('renders RootWithIntl when translations are present', () => {
    renderRoot();
    expect(screen.getByTestId('root-with-intl')).toBeInTheDocument();
  });

  it('addEpic only adds a new epic once', () => {
    const mockAdd = jest.fn();
    const epic = jest.fn();

    renderRoot({
      epics: { add: mockAdd },
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
      okapi: {
        url: '',
        tenant: 'diku',
        withoutOkapi: true,
      },
    };

    const { rerender } = renderRoot(props);

    rerender(getRootComponent({
      ...props,
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
});
