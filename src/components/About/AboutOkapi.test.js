/* shhhh, eslint, it's ok. we need "unused" imports for mocks */
/* eslint-disable no-unused-vars */

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import AboutOkapi from './AboutOkapi';
import { useStripes } from '../../StripesContext';
import stripesConnect from '../../stripesConnect';
import AboutEnabledModules from './AboutEnabledModules';

jest.mock('../../StripesContext');
jest.mock('../../stripesConnect');
jest.mock('./AboutEnabledModules', () => () => <></>);

describe('AboutOkapi', () => {
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
      }
    }
  };
  const mockUseStripes = useStripes;
  mockUseStripes.mockReturnValue(stripes);

  it('displays application version details', async () => {
    render(<AboutOkapi />);

    expect(screen.getByText(/about.userInterface/)).toBeInTheDocument();
    expect(screen.getByText(/stripes-connect/)).toBeInTheDocument();
    expect(screen.getByText(/stripes-components/)).toBeInTheDocument();
    expect(screen.getByText(/stripes-logger/)).toBeInTheDocument();

    expect(screen.getByText(/about.okapiServices/)).toBeInTheDocument();
    expect(screen.getByText(/about.version/)).toBeInTheDocument();
    expect(screen.getByText(/about.forTenant/)).toBeInTheDocument();
    expect(screen.getByText(/about.onUrl/)).toBeInTheDocument();

    expect(screen.getByText(/about.moduleCount/)).toBeInTheDocument();
    expect(screen.getByText(/about.interfaceCount/)).toBeInTheDocument();

    expect(screen.getByText(/about.uiOrServiceDependencies/)).toBeInTheDocument();
    // expect(screen.getByText(/about.moduleDependsOn/)).toBeInTheDocument();
  });
});
