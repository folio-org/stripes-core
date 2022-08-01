import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook } from '@testing-library/react-hooks';

import useConfigurations, { configurationsApi } from './useConfigurations';
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

describe('Given useConfigurations', () => {
  describe('configurationsApi', () => {
    const module = 'module';
    const configName = 'configName';
    const code = 'code';

    it('includes module in the API query', () => {
      expect(configurationsApi(module)).toContain(`module=="${module}"`);
    });

    it('includes configName in the API query', () => {
      expect(configurationsApi(module, configName)).toContain(`configName=="${configName}"`);
    });

    it('includes code in the API query', () => {
      expect(configurationsApi(module, configName, code)).toContain(`code=="${code}"`);
    });

    it('joins criteria with "AND"', () => {
      expect(configurationsApi(module, configName, code)).toContain(`module=="${module}" and configName=="${configName}" and code=="${code}"`);
    });

    it('retrieves all values without any criteria', () => {
      expect(configurationsApi()).toContain('configurations/entries?&limit=');
    });
  });

  describe('correctly checks permissions: with permissions', () => {
    const response = { configs: [], totalRecords: 1 };
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

      const { result, waitFor } = renderHook(() => useConfigurations({}), { wrapper });

      await waitFor(() => {
        return !result.current.isLoading;
      });

      expect(result.current.data).toEqual(response);
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

      const { result, waitFor } = renderHook(() => useConfigurations({}), { wrapper });

      await waitFor(() => {
        return !!result.current.error;
      });

      expect(result.current.error.message).toMatch(/configuration.entries.collection.get/);
    });
  });
});

