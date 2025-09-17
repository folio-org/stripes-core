import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import {
  setTokenExpiry,
  requestUserWithPerms
} from '../loginServices';

import OIDCLanding from './OIDCLanding';
import useExchangeCode from './useExchangeCode';

jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    search: 'session_state=dead-beef&code=c0ffee'
  }),
  Redirect: () => <>Redirect</>,
}));

jest.mock('react-redux', () => ({
  useStore: () => { },
}));

jest.mock('../StripesContext', () => ({
  useStripes: () => ({
    okapi: { url: 'https://whaterver' },
    config: { tenantOptions: { diku: { name: 'diku', clientId: 'diku-application' } } },
  }),
}));

jest.mock('./OrganizationLogo', () => (() => <div>OrganizationLogo</div>));

jest.mock('../loginServices', () => ({
  ...(jest.requireActual('../loginServices')),
  setTokenExpiry: jest.fn(() => Promise.resolve()),
  requestUserWithPerms: jest.fn(() => Promise.resolve()),
  getOIDCRedirectUri: () => '',
  getLoginTenant: () => 't',
}));

jest.mock('./useExchangeCode');

// fetch success: resolve promise with ok == true and $data in json()
const mockFetchSuccess = (data) => {
  global.fetch = jest.fn().mockImplementation(() => (
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
      headers: new Map(),
    })
  ));
};

// fetch failure: resolve promise with ok == false and $error in json()
const mockFetchError = (error) => {
  global.fetch = jest.fn().mockImplementation(() => (
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve(error),
      headers: new Map(),
    })
  ));
};

// restore default fetch impl
const mockFetchCleanUp = () => {
  global.fetch.mockClear();
  delete global.fetch;
};

describe('OIDCLanding', () => {
  it('calls requestUserWithPerms, setTokenExpiry on success', async () => {
    const mockUseExchangeCode = useExchangeCode;
    mockUseExchangeCode.mockReturnValue({
      data: { key: 'value' },
      isloading: false,
      error: null,
    });


    mockFetchSuccess({
      accessTokenExpiration: '2024-05-23T09:47:17.000-04:00',
      refreshTokenExpiration: '2024-05-23T10:07:17.000-04:00',
    });

    await render(<OIDCLanding />);
    screen.getByText('Loading');
    await waitFor(() => expect(setTokenExpiry).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(requestUserWithPerms).toHaveBeenCalledTimes(1));
    mockFetchCleanUp();
  });
});
