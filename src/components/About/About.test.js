import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import AboutAPIGateway from './AboutAPIGateway';
import AboutApplicationVersions from './AboutApplicationVersions';
import AboutEnabledModules from './AboutEnabledModules';
import AboutInstallMessages from './AboutInstallMessages';
import AboutOkapi from './AboutOkapi';
import AboutStripes from './AboutStripes';
import AboutUIDependencies from './AboutUIDependencies';
import AboutUIModuleDetails from './AboutUIModuleDetails';
import WarningBanner from './WarningBanner';

import { okapi as okapiConfig } from 'stripes-config';

import { useStripes } from '../../StripesContext';
import About from './About';

jest.mock('./AboutAPIGateway', () => () => 'AboutAPIGateway');
jest.mock('./AboutApplicationVersions', () => () => 'AboutApplicationVersions');
jest.mock('./AboutEnabledModules', () => () => 'AboutEnabledModules');
jest.mock('./AboutInstallMessages', () => () => 'AboutInstallMessages');
jest.mock('./AboutOkapi', () => () => 'AboutOkapi');
jest.mock('./AboutStripes', () => () => 'AboutStripes');
jest.mock('./AboutUIDependencies', () => () => 'AboutUIDependencies');
jest.mock('./AboutUIModuleDetails', () => () => 'AboutUIModuleDetails');
jest.mock('./WarningBanner', () => () => 'WarningBanner');

jest.mock('stripes-config', () => ({
  okapi: { tenantEntitlementUrl: true },
}));


// set query retries to false. otherwise, react-query will thoughtfully
// (but unhelpfully, in the context of testing) retry a failed query
// several times causing the test to timeout when what we really want
// is for it to throw so we can catch and test the exception.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
});

jest.mock('../../StripesContext');

describe('About', () => {
  it('displays application discovery details', async () => {
    const modules = {
      app: [
        {
          module: 'app-alpha',
          version: '1.2.3',
          okapiInterfaces: {
            iAlpha: '1.0',
          }
        },
        { module: 'app-beta', version: '2.3.4' }
      ],
      settings: [
        { module: 'settings-alpha', version: '3.4.5' },
        { module: 'settings-beta', version: '4.5.6' }
      ],
      plugin: [
        { module: 'plugin-alpha', version: '5.6.7' },
        { module: 'plugin-beta', version: '6.7.8' }
      ],
      typeThatHasNotBeenInventedYet: [
        { module: 'typeThatHasNotBeenInventedYet-alpha', version: '7.8.9' },
        { module: 'typeThatHasNotBeenInventedYet-beta', version: '8.9.10' }
      ],
    };

    const stripes = {
      okapi: {
        tenant: 'barbie',
        url: 'https://oppie.edu',
      },
      discovery: {
        modules,
        interfaces: {
          bar: '1.0',
          bat: '2.0',
        },
        isFinished: true,
      }
    };

    const mockUseStripes = useStripes;
    mockUseStripes.mockReturnValue(stripes);

    render(
      <QueryClientProvider client={queryClient}>
        <About />
      </QueryClientProvider>
    );

    expect(screen.getByText(/WarningBanner/)).toBeInTheDocument();
    expect(screen.getByText(/AboutInstallMessages/)).toBeInTheDocument();
    expect(screen.getByText(/AboutApplicationVersions/)).toBeInTheDocument();
    expect(screen.getByText(/AboutStripes/)).toBeInTheDocument();
    expect(screen.getByText(/AboutAPIGateway/)).toBeInTheDocument();
    expect(screen.getByText(/about.uiOrServiceDependencies/)).toBeInTheDocument();
    expect(screen.getByText(/AboutUIModuleDetails/)).toBeInTheDocument();
    expect(screen.getByText(/AboutUIDependencies/)).toBeInTheDocument();
    expect(screen.queryByText(/AboutOkapi/)).toBe(null);
  });
});
