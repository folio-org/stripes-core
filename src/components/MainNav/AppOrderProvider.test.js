import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';

import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { LastVisitedContext } from '../LastVisited';

import {
  AppOrderProvider,
  useAppOrderContext
} from './AppOrderProvider';

const mockUseLocation = jest.fn(() => ({ pathname: 'home/' }));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => mockUseLocation())
}));

const mockUseModules = jest.fn(() => ({ app: [] }));
jest.mock('../../ModulesContext', () => ({
  useModules: jest.fn(() => mockUseModules())
}));

const mockGetPreference = jest.fn(() => {});
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

const settingsOnly = [{
  active: false,
  description: 'stripes-core.folioSettings',
  displayName: 'stripes-core.settings',
  href: '/settings',
  iconData: {
    alt: 'stripes-core.folioSettings',
    src: {},
    title: 'stripes-core.settings',
  },
  id: 'clickable-settings',
  name: 'settings',
  route: '/settings',
}];

// apps as per stripes-config...
const testAppModules = [
  {
    displayName: 'Invoices',
    route: '/invoice',
    queryResource: 'query',
    module: '@folio/invoice',
    description: 'Invoice',
    version: '6.1.1090000001259'
  },
  {
    handlerName: 'eventHandler',
    displayName: 'Agreements',
    route: '/erm',
    home: '/erm/agreements',
    queryResource: 'query',
    module: '@folio/agreements',
    description: 'ERM agreement functionality for Stripes',
    version: '11.2.109900000000321'
  },
  {
    displayName: 'Bulk edit',
    route: '/bulk-edit',
    home: '/bulk-edit',
    module: '@folio/bulk-edit',
    description: 'Description for bulk edit',
    version: '4.2.2090000003517'
  },
  {
    displayName: 'Check in',
    route: '/checkin',
    queryResource: 'query',
    module: '@folio/checkin',
    description: 'Item Check-in',
    version: '9.3.109000000926'
  }
];

// default order - same as config.
const testOrderedNoPref = [
  {
    id: 'clickable-invoice-module',
    href: '/invoice',
    active: false,
    name: 'invoice',
    displayName: 'Invoices',
    route: '/invoice',
    queryResource: 'query',
    module: '@folio/invoice',
    description: 'Invoice',
    version: '6.1.1090000001259'
  },
  {
    id: 'clickable-agreements-module',
    href: '/erm/agreements',
    active: false,
    name: 'agreements',
    handlerName: 'eventHandler',
    displayName: 'Agreements',
    route: '/erm',
    home: '/erm/agreements',
    queryResource: 'query',
    module: '@folio/agreements',
    description: 'ERM agreement functionality for Stripes',
    version: '11.2.109900000000321'
  },
  {
    id: 'clickable-bulk-edit-module',
    href: '/bulk-edit',
    active: false,
    name: 'bulk-edit',
    displayName: 'Bulk edit',
    route: '/bulk-edit',
    home: '/bulk-edit',
    module: '@folio/bulk-edit',
    description: 'Description for bulk edit',
    version: '4.2.2090000003517'
  },
  {
    id: 'clickable-checkin-module',
    href: '/checkin',
    active: false,
    name: 'checkin',
    displayName: 'Check in',
    route: '/checkin',
    queryResource: 'query',
    module: '@folio/checkin',
    description: 'Item Check-in',
    version: '9.3.109000000926'
  },
  ...settingsOnly
];

// default order preference (value that's derived when no user preferred order is present) - same order as config.
const testPreferencedOrderNoPref = [
  {
    name: 'invoice',
  },
  {
    name: 'agreements',
  },
  {
    name: 'bulk-edit',
  },
  {
    name: 'checkin',
  },
  {
    name: 'settings',
  }
];

// order changed via prefs to move 'checkin' to the start of the list...
const testOrderedWithPref = [
  {
    id: 'clickable-checkin-module',
    href: '/checkin',
    active: false,
    name: 'checkin',
    displayName: 'Check in',
    route: '/checkin',
    queryResource: 'query',
    module: '@folio/checkin',
    description: 'Item Check-in',
    version: '9.3.109000000926'
  },
  {
    id: 'clickable-invoice-module',
    href: '/invoice',
    active: false,
    name: 'invoice',
    displayName: 'Invoices',
    route: '/invoice',
    queryResource: 'query',
    module: '@folio/invoice',
    description: 'Invoice',
    version: '6.1.1090000001259'
  },
  {
    id: 'clickable-agreements-module',
    href: '/erm/agreements',
    active: false,
    name: 'agreements',
    handlerName: 'eventHandler',
    displayName: 'Agreements',
    route: '/erm',
    home: '/erm/agreements',
    queryResource: 'query',
    module: '@folio/agreements',
    description: 'ERM agreement functionality for Stripes',
    version: '11.2.109900000000321'
  },
  {
    id: 'clickable-bulk-edit-module',
    href: '/bulk-edit',
    active: false,
    name: 'bulk-edit',
    displayName: 'Bulk edit',
    route: '/bulk-edit',
    home: '/bulk-edit',
    module: '@folio/bulk-edit',
    description: 'Description for bulk edit',
    version: '4.2.2090000003517'
  },
  ...settingsOnly
];

// order changed to move 'checkin' to the start of the list...
const testPreferencedOrderWithPref = [
  {
    name: 'checkin',
  },
  {
    name: 'invoice',
  },
  {
    name: 'agreements',
  },
  {
    name: 'bulk-edit',
  },
  {
    name: 'settings',
  }
];

describe('AppOrderProvider', () => {
  let renderedHook;


  describe('with no modules', () => {
    beforeAll(async () => {
      renderedHook = await act(() => renderHook(() => useAppOrderContext(), { wrapper }));
    });

    it('provides a settings-only list', () => {
      expect(renderedHook.result.current.apps).toEqual(settingsOnly);
    });

    it('provides preference sorted list (no preference, just default)', () => {
      expect(renderedHook.result.current.appNavOrder).toEqual([{ name: 'settings' }]);
    });

    it('provides pref loading status', () => {
      expect(renderedHook.result.current.isLoading).toBeDefined();
    });

    it('provides update function', () => {
      expect(renderedHook.result.current.updateList).toBeInstanceOf(Function);
    });

    it('provides reset function', () => {
      expect(renderedHook.result.current.reset).toBeInstanceOf(Function);
    });
  });

  describe('with some modules, no preference', () => {
    beforeAll(async () => {
      mockUseModules.mockImplementation(() => ({
        app: testAppModules
      }));
      renderedHook = await act(() => renderHook(() => useAppOrderContext(), { wrapper }));
    });

    it('provides a settings-only list', () => {
      expect(renderedHook.result.current.apps).toEqual(testOrderedNoPref);
    });

    it('provides preference sorted list (no preference, just default)', () => {
      expect(renderedHook.result.current.appNavOrder).toEqual(testPreferencedOrderNoPref);
    });
  });

  describe('with some modules, preferenceOrder', () => {
    beforeAll(async () => {
      mockGetPreference.mockImplementation(() => testPreferencedOrderWithPref);
      mockUseModules.mockImplementation(() => ({
        app: testAppModules
      }));
      renderedHook = await act(() => renderHook(() => useAppOrderContext(), { wrapper }));
    });

    it('provides a settings-only list', () => {
      expect(renderedHook.result.current.apps).toEqual(testOrderedWithPref);
    });

    it('provides preference sorted list (no preference, just default)', () => {
      expect(renderedHook.result.current.appNavOrder).toEqual(testPreferencedOrderWithPref);
    });

    describe('interaction with preferences', () => {
      it('calling updateList calls the setPreference function', () => {
        renderedHook.result.current.updateList([{ name: 'settings' }]);
        expect(mockSetPreference).toHaveBeenCalled();
      });

      it('calling updateList calls the setPreference function', () => {
        renderedHook.result.current.reset();
        expect(mockRemovePreference).toHaveBeenCalled();
      });
    });
  });
});
