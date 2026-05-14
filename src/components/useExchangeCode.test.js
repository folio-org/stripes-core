import { act, render, renderHook, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { createMemoryHistory } from 'history';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import Harness from '../../test/jest/helpers/harness';
import useOkapiKy from '../useOkapiKy';
import OIDCLanding from './OIDCLanding';
import useExchangeCode from './useExchangeCode';
import { useStripes } from '../StripesContext';


jest.mock('./OrganizationLogo', () => (() => <div>OrganizationLogo</div>));
jest.mock('../useOkapiKy');
jest.mock('../StripesContext', () => ({
  useStripes: () => ({ tenant: 'tenant', clientId: 'clientId' })
}));

jest.mock('../loginServices', () => ({
  ...(jest.requireActual('../loginServices')),
  setTokenExpiry: jest.fn(() => Promise.resolve()),
  requestUserWithPerms: jest.fn(() => Promise.resolve()),
  storeLogoutTenant: jest.fn(() => Promise.resolve()),
}));

const queryClient = new QueryClient();
// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useExchangeCode', () => {
  it('errors when code is missing from window.location.search', async () => {
    const callback = jest.fn();

    let hook;
    act(() => {
      hook = renderHook(() => useExchangeCode(callback), { wrapper });
    });

    await waitFor(() => {
      expect(hook.result.current.error).toMatch(/stripes-core.oidc.otp.missingCode/);
    });
  });

  it('extracts JSON errors from the authn/token reponse', async () => {
    window.location.pathname = '/some-path';
    window.location.search = '?code=code';

    const err = 'some error';
    const mockUseOkapiKy = useOkapiKy;
    mockUseOkapiKy.mockReturnValue(() => {
      // OMG lint, shut up about mocks of third party libraries 🙄
      // eslint-disable-next-line no-throw-literal
      throw {
        response: {
          json: async () => err
        }
      };
    });

    const callback = jest.fn();
    let hook;
    act(() => {
      hook = renderHook(() => useExchangeCode(callback), { wrapper });
    });

    await waitFor(() => {
      expect(hook.result.current.error).toMatch(err);
    });
  });

  it('extracts plaintext errors from the authn/token reponse', async () => {
    window.location.pathname = '/some-path';
    window.location.search = '?code=code';

    const err = 'I am nobody; who are you?';
    const mockUseOkapiKy = useOkapiKy;
    mockUseOkapiKy.mockReturnValue(() => {
      throw new Error(err);
    });

    const callback = jest.fn();
    let hook;
    act(() => {
      hook = renderHook(() => useExchangeCode(callback), { wrapper });
    });

    await waitFor(() => {
      expect(hook.result.current.error.message).toMatch(err);
    });
  });

  it('executes the callback when token exchange succeeds', async () => {
    window.location.pathname = '/some-path';
    window.location.search = '?code=code';

    const mockUseOkapiKy = useOkapiKy;
    mockUseOkapiKy.mockReturnValue(() => ({
      json: () => ({ some: 'object' })
    }));

    const callback = jest.fn();

    await act(() => renderHook(() => useExchangeCode(callback), { wrapper }));
    expect(callback).toHaveBeenCalled();
  });
});
