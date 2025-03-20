import { renderHook, waitFor, act } from '@folio/jest-config-stripes/testing-library/react';

import { useQueryLimit, MAX_UNPAGED_RESOURCE_COUNT } from './useQueryLimit';
import { useStripes } from '../StripesContext';

const testLimit = 42;
const mockGetTenantPreference = jest.fn(() => Promise.resolve(testLimit));
jest.mock('./useTenantPreferences', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(() => ({
    getTenantPreference: mockGetTenantPreference,
  }))
}));

jest.mock('../StripesContext');

describe('useQueryLimit', () => {
  describe('with stored preference', () => {
    it('returns preference value', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ stripes: { config: { } } });

      const renderedHook = renderHook(() => useQueryLimit());
      const limit = await act(() => renderedHook.result.current);
      expect(limit).toEqual(testLimit);
    });
  });

  describe('without saved preferences', () => {
    describe('with value in stripes.config', () => {
      it('returns value from stripes.config', async () => {
        // we'll get nothing from settings
        mockGetTenantPreference.mockReturnValue(undefined);

        // we'll get a value from stripes
        const mockUseStripes = useStripes;
        const maxUnpagedResourceCount = 123;
        mockUseStripes.mockReturnValue({ stripes: { config: { maxUnpagedResourceCount } } });

        const renderedHook = renderHook(() => useQueryLimit());
        const limit = await act(() => renderedHook.result.current);

        await waitFor(() => expect(limit).toEqual(maxUnpagedResourceCount));
      });
    });

    describe('without value in stripes.config', () => {
      it('returns default', async () => {
        // we'll get nothing from settings
        mockGetTenantPreference.mockReturnValue(undefined);
        // we'll get nothing from stripes.config
        const mockUseStripes = useStripes;
        mockUseStripes.mockReturnValue({ stripes: { config: { } } });

        const renderedHook = renderHook(() => useQueryLimit());
        const limit = await act(() => renderedHook.result.current);

        await waitFor(() => expect(limit).toEqual(MAX_UNPAGED_RESOURCE_COUNT));
      });
    });
  });
});
