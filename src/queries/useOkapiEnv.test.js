import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import useOkapiEnv from './useOkapiEnv';
import { useStripes } from '../StripesContext';
import useOkapiKy from '../useOkapiKy';

jest.mock('../useOkapiKy');
jest.mock('../StripesContext');

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

describe('Given useOkapiEnv', () => {
  describe('correctly checks permissions: with permissions', () => {
    const response = [{ name: 'MONKEY', value: 'bagel' }];

    beforeEach(() => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({
        hasPerm: () => true,
      });

      const mockUseOkapiKy = useOkapiKy;
      mockUseOkapiKy.mockReturnValue({
        get: () => ({
          json: () => Promise.resolve(response),
        }),
      });
    });

    it('with permission, calls get', async () => {
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result, waitFor } = renderHook(() => useOkapiEnv({}), { wrapper });

      await waitFor(() => {
        return !result.current.isLoading;
      });

      expect(result.current.data).toEqual({ MONKEY: 'bagel' });
    });
  });

  describe('correctly checks permissions: without permissions', () => {
    beforeEach(() => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({
        hasPerm: () => false,
      });

      const mockUseOkapiKy = useOkapiKy;
      mockUseOkapiKy.mockReturnValue({
        get: () => ({
          json: () => Promise.resolve({ configs: [], totalRecords: 1 }),
        }),
      });
    });

    it('without permission, throws an error', async () => {
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result, waitFor } = renderHook(() => useOkapiEnv({}), { wrapper });

      await waitFor(() => {
        return !!result.current.error;
      });

      expect(result.current.error.message).toMatch(/okapi.env.list/);
    });
  });
});

