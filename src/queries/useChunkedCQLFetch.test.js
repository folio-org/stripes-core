import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import useChunkedCQLFetch from './useChunkedCQLFetch';
import useOkapiKy from '../useOkapiKy';

jest.mock('../useOkapiKy');
jest.mock('../StripesContext');

const makeid = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

const baseOptions = {
  endpoint: 'users',
  ids: [
    '1234-5678-a',
    '1234-5678-b',
    '1234-5678-c',
    '1234-5678-d',
    '1234-5678-e'
  ],
  reduceFunction: (uq) => (
    uq.reduce((acc, curr) => {
      return [...acc, ...(curr?.data?.users ?? [])];
    }, [])
  ),
};

// Set these up in beforeEach so it's fresh for each describe -- otherwise get improper test component changes(?)
let queryClient;
let wrapper;
describe('Given useChunkedCQLFetch', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    const response = [{ dummy: 'result' }];

    const mockUseOkapiKy = useOkapiKy;
    mockUseOkapiKy.mockReturnValue({
      get: () => ({
        json: () => Promise.resolve(response),
      }),
    });
  });

  describe('sets up correct number of fetches', () => {
    it('sets up 1 fetch for the 5 ids by default', async () => {
      const { result, waitFor } = renderHook(() => useChunkedCQLFetch({
        ...baseOptions
      }), { wrapper });

      await waitFor(() => {
        const loadingQueries = result.current.itemQueries?.filter(iq => iq.isLoading);

        return loadingQueries.length === 0;
      });

      expect(result.current.itemQueries?.length).toEqual(1);
    });

    it('sets up 3 fetches for the 5 ids when STEP_SIZE = 2', async () => {
      const { result, waitFor } = renderHook(() => useChunkedCQLFetch({
        ...baseOptions,
        STEP_SIZE: 2
      }), { wrapper });

      await waitFor(() => {
        const loadingQueries = result.current.itemQueries?.filter(iq => iq.isLoading);

        return loadingQueries.length === 0;
      });

      expect(result.current.itemQueries?.length).toEqual(3);
    });

    it('sets up 5 fetches for the 5 ids when STEP_SIZE = 1', async () => {
      const { result, waitFor } = renderHook(() => useChunkedCQLFetch({
        ...baseOptions,
        STEP_SIZE: 1
      }), { wrapper });

      await waitFor(() => {
        const loadingQueries = result.current.itemQueries?.filter(iq => iq.isLoading);

        return loadingQueries.length === 0;
      });

      expect(result.current.itemQueries?.length).toEqual(5);
    });
  });

  describe('deduplicates ids as expected', () => {
    it('sets up 1 fetch for the 5 unique ids', async () => {
      const { result, waitFor } = renderHook(() => useChunkedCQLFetch({
        ...baseOptions,
        ids: [
          ...baseOptions.ids,
          ...baseOptions.ids,
          ...baseOptions.ids,
          ...baseOptions.ids,
          ...baseOptions.ids,
        ],
        STEP_SIZE: 5
      }), { wrapper });

      await waitFor(() => {
        const loadingQueries = result.current.itemQueries?.filter(iq => iq.isLoading);

        return loadingQueries.length === 0;
      });

      expect(result.current.itemQueries?.length).toEqual(1);
    });
  });

  describe('works with an id list of > 300 ids', () => {
    it('sets up 1 fetch for the 5 unique ids', async () => {
      const largeIdSet = [];
      for (let i = 0; i < 350; i++) {
        largeIdSet.push(makeid(5));
      }

      const { result, waitFor } = renderHook(() => useChunkedCQLFetch({
        ...baseOptions,
        ids: largeIdSet,
      }), { wrapper });

      await waitFor(() => {
        const loadingQueries = result.current.itemQueries?.filter(iq => iq.isLoading);
        return loadingQueries.length === 0;
      });

      expect(result.current.itemQueries?.length).toEqual(6);
    });
  });
});
