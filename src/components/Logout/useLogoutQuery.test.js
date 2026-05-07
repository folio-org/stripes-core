import localforage from 'localforage';
import { renderHook, act, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import { clearSessionStorage, useLogoutQuery } from './useLogoutQuery';
import { useStripes } from '../../StripesContext';
import {
  clearCurrentUser,
  clearOkapiToken,
  setIsAuthenticated,
} from '../../okapiActions';
import { resetStore } from '../../mainActions';
import { stripesHubAPI } from '../../constants';
import {
  SESSION_NAME,
  TENANT_LOCAL_STORAGE_KEY,
} from '../../loginServices';
import {
  RTR_TIMEOUT_EVENT
} from '../Root/constants';

// restore default fetch impl
const mockFetchCleanUp = () => {
  globalThis.fetch?.mockClear();
  delete globalThis.fetch;
};

const mockStripesHubAPI = stripesHubAPI;
jest.mock('localforage', () => ({
  getItem: jest.fn((str) => {
    if (str === mockStripesHubAPI.HOST_URL_KEY) {
      return Promise.resolve(null);
    }
    return Promise.resolve({ user: {} });
  }),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));


describe('clearSessionStorage', () => {
  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'removeItem');
  });
  afterEach(() => {
    Storage.prototype.removeItem.mockRestore();
    mockFetchCleanUp();
  });

  it('clears timers', async () => {
    globalThis.fetch = jest.fn().mockImplementation(() => Promise.resolve());
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn().mockReturnValue({ config: { preserveConsole: false } }),
    };
    globalThis.sessionStorage.clear();

    const sessionTimer = { clear: jest.fn() };
    await clearSessionStorage(store, null, [sessionTimer]);

    expect(sessionTimer.clear).toHaveBeenCalled();
  });

  it('clears the redux store', async () => {
    globalThis.fetch = jest.fn().mockImplementation(() => Promise.resolve());
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn().mockReturnValue({ config: { preserveConsole: false } }),
    };
    globalThis.sessionStorage.clear();

    await clearSessionStorage(store, null, []);

    expect(store.dispatch).toHaveBeenCalledWith(setIsAuthenticated(false));
    expect(store.dispatch).toHaveBeenCalledWith(clearCurrentUser());
    expect(store.dispatch).toHaveBeenCalledWith(clearOkapiToken());
    expect(store.dispatch).toHaveBeenCalledWith(resetStore());
  });

  it('clears localStorage', async () => {
    globalThis.fetch = jest.fn().mockImplementation(() => Promise.resolve());
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn().mockReturnValue({ config: { preserveConsole: false } }),
    };
    globalThis.sessionStorage.clear();

    await clearSessionStorage(store, null, []);

    expect(localStorage.removeItem).toHaveBeenCalledWith(SESSION_NAME);
    expect(localStorage.removeItem).toHaveBeenCalledWith(RTR_TIMEOUT_EVENT);
    expect(localStorage.removeItem).toHaveBeenCalledWith(TENANT_LOCAL_STORAGE_KEY);
    expect(localStorage.removeItem).toHaveBeenCalledWith(stripesHubAPI.FOLIO_CONFIG_KEY);
    expect(localStorage.removeItem).toHaveBeenCalledWith(stripesHubAPI.BRANDING_CONFIG_KEY);
  });

  it('clears localforage', async () => {
    globalThis.fetch = jest.fn().mockImplementation(() => Promise.resolve());
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn().mockReturnValue({ config: { preserveConsole: false } }),
    };
    globalThis.sessionStorage.clear();

    await clearSessionStorage(store, null, []);

    expect(localforage.removeItem).toHaveBeenCalledWith(SESSION_NAME);
    expect(localforage.removeItem).toHaveBeenCalledWith('loginResponse');
    expect(localforage.removeItem).toHaveBeenCalledWith(stripesHubAPI.DISCOVERY_URL_KEY);
    expect(localforage.removeItem).toHaveBeenCalledWith(stripesHubAPI.HOST_URL_KEY);
    expect(localforage.removeItem).toHaveBeenCalledWith(stripesHubAPI.REMOTE_LIST_KEY);
  });

  it('calls queryClient.removeQueries()', async () => {
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn().mockReturnValue({ okapi: { tenant: 'diku' }, config: { preserveConsole: false } }),
    };
    const rqc = {
      removeQueries: jest.fn(),
    };

    await clearSessionStorage(store, rqc, []);

    expect(rqc.removeQueries).toHaveBeenCalled();
  });
});


const mockPost = jest.fn();

jest.mock('../../useOkapiKy', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(() => ({
    post: mockPost,
  }))
}));

jest.mock('../../StripesContext');

// , () => ({
//   useStripes: () => ({
//     user: {
//       user: {
//         id: 'test-user'
//       }
//     },
//     okapi: {
//       tenant: 't',
//     },
//     logger: {
//       log: () => { },
//     },
//     store: {
//       getState: () => ({}),
//     },
//   }),
// }));

const queryClient = new QueryClient();
// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useLogoutQuery', () => {
  describe('when storage-flag is present', () => {
    beforeEach(() => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(true);
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({
        config: {},
        okapi: { isAuthenticated: true },
        store: {
          dispatch: jest.fn(),
          getState: jest.fn().mockReturnValue({ config: { preserveConsole: false } }),
        }
      });
    });

    afterEach(() => {
      Storage.prototype.getItem.mockRestore();
      mockPost.mockReset();
    });

    it('makes /authn/logout API call', async () => {
      renderHook(() => useLogoutQuery([]), { wrapper });

      await waitFor(async () => {
        expect(mockPost).toHaveBeenCalled();
      });
    });

    it('clears storage', async () => {
      const timer = { clear: jest.fn() };
      renderHook(() => useLogoutQuery([timer]), { wrapper });

      await waitFor(async () => {
        expect(timer.clear).toHaveBeenCalled();
      });
    });
  });

  describe('when storage-flag is absent', () => {
    beforeEach(() => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(false);
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({
        config: {},
        okapi: { isAuthenticated: true },
        store: {
          dispatch: jest.fn(),
          getState: jest.fn().mockReturnValue({ config: { preserveConsole: true } }),
        }
      });
    });

    afterEach(() => {
      Storage.prototype.getItem.mockRestore();
      mockPost.mockReset();
    });

    it('skips /authn/logout API call', async () => {
      act(() => {
        renderHook(() => useLogoutQuery([]), { wrapper });
      });
      await waitFor(async () => {
        expect(mockPost).not.toHaveBeenCalled();
      });
    });

    it('clears storage', async () => {
      const timer = { clear: jest.fn() };
      act(() => {
        renderHook(() => useLogoutQuery([timer]), { wrapper });
      });

      await waitFor(async () => {
        expect(timer.clear).toHaveBeenCalled();
      });
    });
  });
});
