import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import { useDispatch, useStore } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import { config } from 'stripes-config';

import { defaultErrors } from '../../constants';
import { setAuthError } from '../../okapiActions';
import { requestUserWithPerms } from '../../loginServices';
import { parseJWT } from '../../helpers';

import useSSOSession from './useSSOSession';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn()
}));

jest.mock('react-cookie', () => ({
  useCookies: jest.fn()
}));

jest.mock('react-redux', () => ({
  useStore: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('stripes-config', () => ({
  config: {
    useSecureTokens: true,
  },
}),
{ virtual: true });

jest.mock('');

jest.mock('../../loginServices', () => ({
  requestUserWithPerms: jest.fn()
}));
jest.mock('../../helpers', () => ({
  parseJWT: jest.fn()
}));

describe('SSOLanding', () => {
  const ssoTokenValue = 'c0ffee';

  beforeEach(() => {
    useLocation.mockReturnValue({ search: '' });
    useCookies.mockReturnValue([]);

    useStore.mockReturnValue({
      getState: jest.fn().mockReturnValue({
        okapi: {
          url: 'okapiUrl',
          tenant: 'okapiTenant'
        }
      })
    });

    requestUserWithPerms.mockReturnValue(Promise.resolve());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should request user session when RTR is disabled and token from query params', () => {
    const store = useStore();

    useLocation.mockReturnValue({ search: `ssoToken=${ssoTokenValue}` });
    config.useSecureTokens = false;

    renderHook(() => useSSOSession());

    expect(requestUserWithPerms).toHaveBeenCalledWith(store.getState().okapi.url, store, store.getState().okapi.tenant, ssoTokenValue);
  });

  it('should request user session when RTR is disabled with token from cookies', () => {
    const store = useStore();

    useCookies.mockReturnValue([{ ssoToken: ssoTokenValue }]);
    config.useSecureTokens = false;

    renderHook(() => useSSOSession());

    expect(requestUserWithPerms).toHaveBeenCalledWith(store.getState().okapi.url, store, 'okapiTenant', ssoTokenValue);
  });

  it('should request user session when RTR is disabled and right tenant from ssoToken', () => {
    const tokenTenant = 'tokenTenant';
    const store = useStore();

    useLocation.mockReturnValue({ search: `ssoToken=${ssoTokenValue}` });
    parseJWT.mockReturnValue({ tenant: tokenTenant });
    config.useSecureTokens = false;

    renderHook(() => useSSOSession());

    expect(requestUserWithPerms).toHaveBeenCalledWith(store.getState().okapi.url, store, tokenTenant, ssoTokenValue);
  });

  it('should request user session when RTR is enabled and right tenant from query params', () => {
    const queryTenant = 'queryTenant';
    const store = useStore();

    useLocation.mockReturnValue({ search: `tenantId=${queryTenant}` });
    config.useSecureTokens = true;

    renderHook(() => useSSOSession());

    expect(requestUserWithPerms).toHaveBeenCalledWith(store.getState().okapi.url, store, queryTenant, undefined);
  });

  it('should display error when session request failed', async () => {
    const queryTenant = 'queryTenant';
    const dispatch = jest.fn();

    requestUserWithPerms.mockReturnValue(Promise.reject());
    useDispatch.mockReturnValue(dispatch);
    useLocation.mockReturnValue({ search: `tenant=${queryTenant}` });
    config.useSecureTokens = true;

    renderHook(() => useSSOSession());

    await waitFor(() => expect(requestUserWithPerms).toHaveBeenCalled());

    expect(dispatch).toHaveBeenCalledWith(setAuthError([defaultErrors.SSO_SESSION_FAILED_ERROR]));
  });
});
