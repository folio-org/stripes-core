
import { render } from '@folio/jest-config-stripes/testing-library/react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { MemoryRouter as Router, Route } from 'react-router-dom';
import QueryStateUpdater from './QueryStateUpdater';

const mockUpdateQueryResource = jest.fn();
jest.mock('../../locationService', () => ({
  ...jest.requireActual('../../locationService'),
  updateLocation: jest.fn(),
  updateQueryResource: jest.fn(() => mockUpdateQueryResource()),
  getCurrentModule: jest.fn(() => true)
}));

const mockUnsubscribe = jest.fn();
const stripes = {
  store: {
    subscribe: jest.fn(() => mockUnsubscribe)
  }
};

describe('QueryStateUpdater', () => {
  let qc;
  let wrapper;
  beforeAll(() => {
    qc = new QueryClient();
    wrapper = (testLocation = { pathname: '/initial' }) => ({ children }) => {
      qc = new QueryClient();
      return (
        <Router initialEntries={['/initial']}>
          <QueryClientProvider client={qc}>
            <Route
              path="*"
              location={testLocation}
            >
              {children}
            </Route>
          </QueryClientProvider>
        </Router>
      );
    };
  });
  it('renders', () => {
    expect(() => render(
      <QueryStateUpdater queryClient={qc} stripes={stripes} />,
      { wrapper: wrapper() }
    )).not.toThrow();
  });

  it('updatesQuery on mount', () => {
    let testVal = {
      hash: '',
      key: 'f727ww',
      pathname: '/initial',
      search: '',
      state: undefined
    };
    const { rerender } = render(
      <QueryStateUpdater
        stripes={stripes}
        queryClient={qc}
      />,
      { wrapper: wrapper(testVal) }
    );
    testVal = {
      hash: '',
      key: 'f727w2',
      pathname: '/updated',
      search: '',
      state: undefined
    };
    rerender(
      <QueryStateUpdater
        stripes={stripes}
        queryClient={qc}
        location={testVal}
      />,
      { wrapper: wrapper(testVal) }
    );

    expect(() => rerender(
      <QueryStateUpdater
        stripes={stripes}
        queryClient={qc}
        location={testVal}
      />,
      { wrapper: wrapper(testVal) }
    )).not.toThrow();
  });
});
