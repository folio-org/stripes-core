import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import OIDCLanding, { exchangeOtp } from './OIDCLanding';

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

const mockSetTokenExpiry = jest.fn();
const mockRequestUserWithPerms = jest.fn();
jest.mock('../loginServices', () => ({
  getLoginTenant: () => 't',
  getOIDCRedirectUri: () => 'http://someurl.edu',
  getTokenExpiry: () => Promise.resolve({
    atExpires: Date.now() + 60 * 1000,
  }),
  requestUserWithPerms: () => Promise.resolve(mockRequestUserWithPerms()),
  setTokenExpiry: () => Promise.resolve(mockSetTokenExpiry()),
  storeLogoutTenant: jest.fn(),
}));

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

const mockSelfError = (data, error) => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce(() => ({
      ok: true,
      json: () => Promise.resolve(data),
      headers: new Map(),
    }))
    .mockResolvedValueOnce(() => ({
      ok: false,
      json: () => Promise.resolve(error),
      headers: new Map(),
    }));
};

// restore default fetch impl
const mockFetchCleanUp = () => {
  global.fetch.mockClear();
  delete global.fetch;
};

describe('OIDCLanding', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('after OTP success, calls requestUserWithPerms', async () => {
    mockFetchSuccess({
      accessTokenExpiration: '2024-05-23T09:47:17.000-04:00',
      refreshTokenExpiration: '2024-05-23T10:07:17.000-04:00',
    });

    render(<OIDCLanding />);
    screen.getByText('Loading');
    await waitFor(() => expect(mockRequestUserWithPerms).toHaveBeenCalledTimes(1));
    mockFetchCleanUp();
  });

  it('after OTP error, displays the error', async () => {
    const error = 'barf';
    mockFetchError(error);

    render(<OIDCLanding />);
    waitFor(() => {
      screen.findByText(error, { exact: false });
    });
    mockFetchCleanUp();
  });

  it('after _self request error, displays the error', async () => {
    const tokenData = {
      accessTokenExpiration: '2024-05-23T09:47:17.000-04:00',
      refreshTokenExpiration: '2024-05-23T10:07:17.000-04:00',
    };
    const error = 'barf';
    mockSelfError(tokenData, error);

    render(<OIDCLanding />);
    waitFor(() => {
      screen.findByText(error, { exact: false });
    });
    await waitFor(() => expect(mockRequestUserWithPerms).toHaveBeenCalledTimes(1));

    mockFetchCleanUp();
  });
});

describe('exchangeOtp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sets token and tenant data on success', async () => {
    window.location.search = '?code=code&redirect-url=redirect-url';
    window.dispatchEvent = jest.fn();
    mockFetchSuccess({
      accessTokenExpiration: '2024-05-23T09:47:17.000-04:00',
      refreshTokenExpiration: '2024-05-23T10:07:17.000-04:00',
    });

    const setToken = jest.fn();
    const setTenant = jest.fn();
    exchangeOtp(setToken, setTenant);
    await waitFor(() => {
      expect(setToken).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(setTenant).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
  });

  it('logs an error on failure', async () => {
    window.location.search = '?code=code&redirect-url=redirect-url';
    console.error = jest.fn();
    mockFetchError({
      accessTokenExpiration: '2024-05-23T09:47:17.000-04:00',
      refreshTokenExpiration: '2024-05-23T10:07:17.000-04:00',
    });

    const setToken = jest.fn();
    const setTenant = jest.fn();
    exchangeOtp(setToken, setTenant);
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});
