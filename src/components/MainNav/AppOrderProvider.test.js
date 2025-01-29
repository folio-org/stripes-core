import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { act } from 'react';
// import { useLocation } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { LastVisitedContext } from '../LastVisited';

import {
  AppOrderProvider,
  useAppOrderContext
} from './AppOrderProvider';

// import usePreferences from '../../hooks/usePreferences';

const mockUseLocation = jest.fn(() => ({ pathname: 'home/' }));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => mockUseLocation())
}));

const mockUseModules = jest.fn(() => ({ app: [] }));
jest.mock('../../ModulesContext', () => ({
  useModules: jest.fn(() => mockUseModules())
}));

const mockGetPreference = jest.fn(() => [{ name: 'settings' }]);
const mockSetPreference = jest.fn();
const mockRemovePreference = jest.fn();
jest.mock('../../hooks/usePreferences', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getPreference: mockGetPreference,
    setPreference: mockSetPreference,
    removePreference: mockRemovePreference,
  }))
}));

jest.mock('../../StripesContext', () => ({
  useStripes: () => ({
    user: {
      user: {
        id: 'test-user'
      }
    },
    okapi: {
      tenant: 't',
    },
    logger: {
      log: () => {},
    },
    hasPerm: () => true,
  }),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <LastVisitedContext.Provider value={{ lastVisited: { x_settings: null } }}>
    <QueryClientProvider client={queryClient}>
      <AppOrderProvider>
        {children}
      </AppOrderProvider>
    </QueryClientProvider>
  </LastVisitedContext.Provider>
);

describe('AppOrderProvider', () => {
  let renderedHook;
  const settingsOnly = [{
    active: false,
    description: 'FOLIO settings',
    displayName: 'stripes-core.settings',
    href: '/settings',
    iconData: {
      alt: 'Tenant Settings',
      src: {},
      title: 'Settings',
    },
    id: 'clickable-settings',
    name: 'settings',
    route: '/settings',
  }];

  beforeAll(async () => {
    renderedHook = await act(() => renderHook(() => useAppOrderContext(), { wrapper }));
  });

  it('provides sorted app list', () => {
    expect(renderedHook.result.current.apps).toEqual(settingsOnly);
  });
});
