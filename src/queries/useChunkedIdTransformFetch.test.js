import { QueryClient, QueryClientProvider } from 'react-query';

import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import useChunkedIdTransformFetch from './useChunkedIdTransformFetch';
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
  chunkedQueryIdTransform: (chunkedIds) => `?(${chunkedIds.map(theId => `id==${theId}`).join('||')})`,
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

const response = jest.fn(() => [{ dummy: 'result' }]);
const mockUseOkapiKyValue = {
  get: jest.fn(() => ({
    json: () => Promise.resolve(response()),
  })),
};
const mockUseOkapiKy = useOkapiKy;

describe('Given useChunkedIdTransformFetch', () => {
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

    mockUseOkapiKy.mockClear();
    mockUseOkapiKyValue.get.mockClear();
    mockUseOkapiKy.mockReturnValue(mockUseOkapiKyValue);
  });

  describe('sets up correct number of fetches', () => {
    it('sets up 1 fetch for the 5 ids by default', async () => {
      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions
      }), { wrapper });

      await waitFor(() => {
        const loadingQueries = result.current.itemQueries?.filter(iq => iq.isLoading);

        return loadingQueries.length === 0;
      });

      expect(result.current.itemQueries?.length).toEqual(1);
    });

    it('sets up 3 fetches for the 5 ids when STEP_SIZE = 2', async () => {
      const { result } = renderHook(() => useChunkedIdTransformFetch({
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
      const { result } = renderHook(() => useChunkedIdTransformFetch({
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
      const { result } = renderHook(() => useChunkedIdTransformFetch({
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

      const { result } = renderHook(() => useChunkedIdTransformFetch({
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

  describe('allows parameter overrides', () => {
    it('sets up 1 fetch using alternate ID name', async () => {
      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions,
        idName: 'userId'
      }), { wrapper });

      await waitFor(() => {
        const loadingQueries = result.current.itemQueries?.filter(iq => iq.isLoading);

        return loadingQueries.length === 0;
      });

      expect(result.current.itemQueries?.length).toEqual(1);
    });

    it('sets up 2 fetches with custom limit', async () => {
      const largeIdSet = [];
      for (let i = 0; i < 100; i++) {
        largeIdSet.push(makeid(5));
      }

      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions,
        ids: largeIdSet,
        limit: 100
      }), { wrapper });

      await waitFor(() => {
        const loadingQueries = result.current.itemQueries?.filter(iq => iq.isLoading);
        return loadingQueries.length === 0;
      });

      expect(result.current.itemQueries?.length).toEqual(2);
    });

    it('expose queryKeys based on given ids and endpoint', async () => {
      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions,
        STEP_SIZE: 2,
        tenantId: 'central',
      }), { wrapper });

      await waitFor(() => {
        const loadingQueries = result.current.itemQueries?.filter(iq => iq.isLoading);

        return loadingQueries.length === 0;
      });

      expect(result.current.queryKeys).toHaveLength(3);
      expect(result.current.queryKeys).toStrictEqual([
        ['stripes-core', 'users', ['1234-5678-a', '1234-5678-b'], 'central'],
        ['stripes-core', 'users', ['1234-5678-c', '1234-5678-d'], 'central'],
        ['stripes-core', 'users', ['1234-5678-e'], 'central']
      ]);
    });
  });

  describe('allows work in provided tenant', () => {
    const providedTenantId = 'providedTenantId';

    it('sets up 1 fetch using alternate tenant ID', async () => {
      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions,
        tenantId: providedTenantId,
      }), { wrapper });

      await waitFor(() => {
        return result.current.itemQueries?.filter(iq => iq.isLoading)?.length === 0;
      });

      expect(mockUseOkapiKy).toHaveBeenCalledWith({ tenant: providedTenantId });
    });

    it('includes tenantId in the generateQueryKey function', async () => {
      const generateQueryKey = jest.fn();

      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions,
        generateQueryKey,
        tenantId: providedTenantId,
      }), { wrapper });

      await waitFor(() => {
        return result.current.itemQueries?.filter(iq => iq.isLoading)?.length === 0;
      });

      expect(generateQueryKey).toHaveBeenCalledWith(expect.objectContaining({ tenantId: providedTenantId }));
    });
  });

  describe('allows work in provided tenant', () => {
    const providedTenantId = 'providedTenantId';

    it('sets up 1 fetch using alternate tenant ID', async () => {
      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions,
        tenantId: providedTenantId,
      }), { wrapper });

      await waitFor(() => {
        return result.current.itemQueries?.filter(iq => iq.isLoading)?.length === 0;
      });

      expect(mockUseOkapiKy).toHaveBeenCalledWith({ tenant: providedTenantId });
    });

    it('includes tenantId in the generateQueryKey function', async () => {
      const generateQueryKey = jest.fn();

      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions,
        generateQueryKey,
        tenantId: providedTenantId,
      }), { wrapper });

      await waitFor(() => {
        return result.current.itemQueries?.filter(iq => iq.isLoading)?.length === 0;
      });

      expect(generateQueryKey).toHaveBeenCalledWith(expect.objectContaining({ tenantId: providedTenantId }));
    });
  });

  describe('reduceFunction works as expected', () => {
    beforeEach(() => {
      response.mockClear();
      response.mockImplementationOnce(() => (['a', 'b', 'c']));
      response.mockImplementationOnce(() => (['d', 'e', 'f']));
      response.mockImplementationOnce(() => (['g', 'h', 'i']));
      mockUseOkapiKy.mockClear();
      mockUseOkapiKyValue.get.mockClear();
      mockUseOkapiKy.mockReturnValue(mockUseOkapiKyValue);
    });

    it('sets up 3 fetches using custom reduce hook', async () => {
      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions,
        reduceFunction: (queries) => (
          queries.reduce((acc, curr) => {
            return [...acc, ...(curr?.data ?? [])];
          }, [])
        ),
        STEP_SIZE: 2
      }), { wrapper });

      await waitFor(() => {
        return result.current.itemQueries?.filter(iq => iq.isLoading)?.length === 0;
      });

      await waitFor(() => {
        expect(result.current.items).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']);
      });
    });
  });

  describe('chunkedQueryIdTransform works as expected', () => {
    it('sets up 3 fetches using default chunkedQueryIdTransform', async () => {
      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions,
        STEP_SIZE: 2
      }), { wrapper });

      await waitFor(() => {
        return result.current.itemQueries?.filter(iq => iq.isLoading)?.length === 0;
      });

      expect(mockUseOkapiKyValue.get.mock.calls[0][0]).toEqual('users');
      expect(mockUseOkapiKyValue.get.mock.calls[0][1]).toEqual({ searchParams: '?(id==1234-5678-a||id==1234-5678-b)' });

      expect(mockUseOkapiKyValue.get.mock.calls[1][0]).toEqual('users');
      expect(mockUseOkapiKyValue.get.mock.calls[1][1]).toEqual({ searchParams: '?(id==1234-5678-c||id==1234-5678-d)' });

      expect(mockUseOkapiKyValue.get.mock.calls[2][0]).toEqual('users');
      expect(mockUseOkapiKyValue.get.mock.calls[2][1]).toEqual({ searchParams: '?(id==1234-5678-e)' });
    });

    it('sets up 3 fetches using custom chunkedQueryIdTransform', async () => {
      const { result } = renderHook(() => useChunkedIdTransformFetch({
        ...baseOptions,
        chunkedQueryIdTransform: (idChunk) => `?wibble=true&${idChunk.map(theId => `anId=~=${theId}`)}`,
        STEP_SIZE: 2
      }), { wrapper });

      await waitFor(() => {
        return result.current.itemQueries?.filter(iq => iq.isLoading)?.length === 0;
      });

      expect(mockUseOkapiKyValue.get.mock.calls[0][0]).toEqual('users');
      expect(mockUseOkapiKyValue.get.mock.calls[0][1]).toEqual({ searchParams: '?wibble=true&anId=~=1234-5678-a,anId=~=1234-5678-b' });

      expect(mockUseOkapiKyValue.get.mock.calls[1][0]).toEqual('users');
      expect(mockUseOkapiKyValue.get.mock.calls[1][1]).toEqual({ searchParams: '?wibble=true&anId=~=1234-5678-c,anId=~=1234-5678-d' });

      expect(mockUseOkapiKyValue.get.mock.calls[2][0]).toEqual('users');
      expect(mockUseOkapiKyValue.get.mock.calls[2][1]).toEqual({ searchParams: '?wibble=true&anId=~=1234-5678-e' });
    });
  });
});
