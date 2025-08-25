import { act } from 'react';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import useSettings from './useSettings';
import { usePreferences, useTenantPreferences } from '../hooks';
import Harness from '../../test/jest/helpers/harness';

jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  useTenantPreferences: jest.fn(),
  usePreferences: jest.fn(),
}));

const mockGetPreference = jest.fn().mockResolvedValue({});
const mockSetPreference = jest.fn();
const mockRemovePreference = jest.fn();
const mockGetTenantPreference = jest.fn().mockResolvedValue({});
const mockSetTenantPreference = jest.fn();
const mockRemoveTenantPreference = jest.fn();

describe('useSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    usePreferences.mockReturnValue({
      getPreference: mockGetPreference,
      setPreference: mockSetPreference,
      removePreference: mockRemovePreference,
    });

    useTenantPreferences.mockReturnValue({
      getTenantPreference: mockGetTenantPreference,
      setTenantPreference: mockSetTenantPreference,
      removeTenantPreference: mockRemoveTenantPreference,
    });
  });

  describe('when userId is provided', () => {
    it('should fetch user preferences', async () => {
      const userPreference = { locale: 'en' };

      mockGetPreference.mockResolvedValue(userPreference);

      const { result } = renderHook(
        () => useSettings({ scope: 'testScope', key: 'testKey', userId: 'user-123' }),
        { wrapper: Harness }
      );

      await act(() => !result.current.isLoading);

      expect(mockGetPreference).toHaveBeenCalledWith({
        scope: 'testScope',
        key: 'testKey',
        userId: 'user-123'
      });
      expect(mockGetTenantPreference).not.toHaveBeenCalled();
      expect(result.current.settings).toEqual(userPreference);
    });

    it('should update user preferences', async () => {
      const newSettings = { locale: 'en' };

      const { result } = renderHook(
        () => useSettings({ scope: 'testScope', key: 'testKey', userId: 'user-123' }),
        { wrapper: Harness }
      );

      await act(() => result.current.updateSetting(newSettings));

      expect(mockSetPreference).toHaveBeenCalledWith({
        scope: 'testScope',
        key: 'testKey',
        value: newSettings
      });
      expect(mockSetTenantPreference).not.toHaveBeenCalled();
    });

    it('should remove user preferences', async () => {
      const { result } = renderHook(
        () => useSettings({ scope: 'testScope', key: 'testKey', userId: 'user-123' }),
        { wrapper: Harness }
      );

      await act(() => result.current.removeSetting());

      expect(mockRemovePreference).toHaveBeenCalledWith({
        scope: 'testScope',
        key: 'testKey'
      });
      expect(mockRemoveTenantPreference).not.toHaveBeenCalled();
    });
  });

  describe('when userId is not provided', () => {
    it('should fetch tenant preferences', async () => {
      const tenantPreference = { locale: 'en' };

      mockGetTenantPreference.mockResolvedValue(tenantPreference);

      const { result } = renderHook(
        () => useSettings({ scope: 'testScope', key: 'testKey' }),
        { wrapper: Harness }
      );

      await act(() => !result.current.isLoading);

      expect(mockGetTenantPreference).toHaveBeenCalledWith({
        scope: 'testScope',
        key: 'testKey'
      });
      expect(mockGetPreference).not.toHaveBeenCalled();
      expect(result.current.settings).toEqual(tenantPreference);
    });

    it('should update tenant preferences', async () => {
      const newSettings = { locale: 'en' };

      const { result } = renderHook(
        () => useSettings({ scope: 'testScope', key: 'testKey' }),
        { wrapper: Harness }
      );

      await act(() => result.current.updateSetting(newSettings));

      expect(mockSetTenantPreference).toHaveBeenCalledWith({
        scope: 'testScope',
        key: 'testKey',
        value: newSettings
      });
      expect(mockSetPreference).not.toHaveBeenCalled();
    });

    it('should remove tenant preferences', async () => {
      const { result } = renderHook(
        () => useSettings({ scope: 'testScope', key: 'testKey' }),
        { wrapper: Harness }
      );

      await act(() => result.current.removeSetting());

      expect(mockRemoveTenantPreference).toHaveBeenCalledWith({
        scope: 'testScope',
        key: 'testKey'
      });
      expect(mockRemovePreference).not.toHaveBeenCalled();
    });
  });
});
