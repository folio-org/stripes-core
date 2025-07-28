import { renderHook, waitFor, act } from '@folio/jest-config-stripes/testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import useTenantPreferences from './useTenantPreferences';

const testValue = { pref: '22' };
const response = {
  items: [
    {
      id: '2ae496b4-244e-4d19-aee7-61f195cdd524',
      scope: 'test.manage',
      key: 'testPref',
      value: { pref: '22' },
    },
  ],
  'resultInfo': {
    'totalRecords': 1,
    'diagnostics': []
  }
};

const emptyResponse = {
  items: [],
  'resultInfo': {
    'totalRecords': 0,
    'diagnostics': []
  }
};

const mockGet = jest.fn(() => ({
  ok: true,
  json: () => response,
}));
const mockPut = jest.fn();
const mockPost = jest.fn();
const mockDelete = jest.fn();

jest.mock('../useOkapiKy', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(() => ({
    get: mockGet,
    put: mockPut,
    post: mockPost,
    delete: mockDelete
  }))
}));

jest.mock('../StripesContext', () => ({
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
    }
  }),
}));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useTenantPreferences', () => {
  let renderedHook;

  beforeAll(() => {
    renderedHook = renderHook(() => useTenantPreferences(), { wrapper });
  });

  describe('getTenantPreference', () => {
    let pref;
    beforeEach(async () => {
      pref = await act(() => renderedHook.result.current.getTenantPreference({ scope: 'test.manage', key: 'testPref' }));
    });

    it('getTenantPreference returns preference value', () => {
      expect(pref).toEqual(testValue);
    });

    describe('subsequent setTenantPreference call ', () => {
      beforeEach(async () => {
        await renderedHook.result.current.setTenantPreference({ scope: 'test.manage', key: 'testPref', value: { pref: 25 } });
      });

      it('uses "put" method', () => {
        expect(mockPut).toHaveBeenCalled();
      });
    });

    describe('subsequent deleteTenantPreference call ', () => {
      beforeEach(async () => {
        await renderedHook.result.current.removeTenantPreference({ scope: 'test.manage', key: 'testPref' });
      });

      it('uses "delete" method', () => {
        expect(mockDelete).toHaveBeenCalled();
      });
    });
  });

  describe('with no saved preferences', () => {
    let pref;
    beforeEach(async () => {
      renderedHook = renderHook(() => useTenantPreferences(), { wrapper });
      mockGet.mockImplementation(() => ({
        ok: true,
        json: () => emptyResponse,
      }));
      pref = await act(() => renderedHook.result.current.getTenantPreference({ scope: 'test.manage', key: 'testPref' }));
    });

    it('getTenantPreference returns undefined', async () => {
      await waitFor(() => expect(pref).toEqual(undefined));
    });

    describe('subsequent setTenantPreference call ', () => {
      beforeEach(async () => {
        await renderedHook.result.current.setTenantPreference({ scope: 'test.manage', key: 'testPref', value: { pref: 25 } });
      });

      it('uses "post" method', async () => {
        await waitFor(() => expect(mockPost).toHaveBeenCalled());
      });
    });
  });
});
