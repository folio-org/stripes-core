import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { act } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import usePreferences from './usePreferences';
import useOkapiKy from '../useOkapiKy';

const testValue = { pref: '22' };
const response = {
  items: [
    {
      id: '2ae496b4-244e-4d19-aee7-61f195cdd524',
      scope: 'test.manage',
      key: 'testPref',
      value: { pref: '22' },
      userId: 'test-user'
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

describe('usePreferences', () => {
  let renderedHook;

  beforeAll(() => {
    renderedHook = renderHook(() => usePreferences(), { wrapper });
  });

  describe('getPreference', () => {
    let pref;
    beforeEach(async () => {
      pref = await act(() => renderedHook.result.current.getPreference({ scope: 'test.manage', key: 'testPref' }));
    });

    it('getPreference returns preference value', () => {
      expect(pref).toEqual(testValue);
    });

    describe('subsequent setPreference call ', () => {
      beforeEach(async () => {
        await renderedHook.result.current.setPreference({ scope: 'test.manage', key: 'testPref', value: { pref: 25 } });
      });

      it('uses "put" method', () => {
        expect(mockPut).toHaveBeenCalled();
      });
    });

    describe('subsequent deletePreference call ', () => {
      beforeEach(async () => {
        await renderedHook.result.current.removePreference({ scope: 'test.manage', key: 'testPref' });
      });

      it('uses "delete" method', () => {
        expect(mockDelete).toHaveBeenCalled();
      });
    });
  });

  describe('with no saved preferences', () => {
    let pref;
    beforeEach(async () => {
      renderedHook = renderHook(() => usePreferences(), { wrapper });
      mockGet.mockImplementation(() => ({
        ok: true,
        json: () => emptyResponse,
      }));
      pref = await act(() => renderedHook.result.current.getPreference({ scope: 'test.manage', key: 'testPref' }));
    });

    it('getPreference returns undefined', async () => {
      await waitFor(() => expect(pref).toEqual(undefined));
    });

    describe('subsequent setPreference call ', () => {
      beforeEach(async () => {
        await renderedHook.result.current.setPreference({ scope: 'test.manage', key: 'testPref', value: { pref: 25 } });
      });

      it('uses "post" method', async () => {
        await waitFor(() => expect(mockPost).toHaveBeenCalled());
      });
    });
  });
});
