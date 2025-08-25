import { Router as DefaultRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { StripesContext } from '../../../src/StripesContext';

import IntlProvider from './intl';
// import buildStripes from '../__mock__/stripesCore.mock';

const STRIPES = {
  actionNames: [],
  connect: component => component,
  config: {},
  currency: 'USD',
  hasInterface: () => true,
  hasPerm: jest.fn(() => true),
  locale: 'en-US',
  logger: {
    log: () => { },
  },
  okapi: {
    tenant: 'diku',
    url: 'https://folio-testing-okapi.dev.folio.org',
  },
};

const defaultHistory = createMemoryHistory();

const queryClient = new QueryClient();

const Harness = ({
  Router = DefaultRouter,
  stripes,
  children,
  history = defaultHistory,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <StripesContext.Provider value={stripes || STRIPES}>
        <Router history={history}>
          <IntlProvider>
            {children}
          </IntlProvider>
        </Router>
      </StripesContext.Provider>
    </QueryClientProvider>
  );
};

export default Harness;
