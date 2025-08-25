import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import OIDCLanding from './OIDCLanding';

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
const mockFoo = jest.fn();
jest.mock('../loginServices', () => ({
  setTokenExpiry: () => mockSetTokenExpiry(),
  requestUserWithPerms: () => mockRequestUserWithPerms(),
  foo: () => mockFoo(),
  getOIDCRedirectUri: () => '',
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

// restore default fetch impl
const mockFetchCleanUp = () => {
  global.fetch.mockClear();
  delete global.fetch;
};

describe('OIDCLanding', () => {
  it('calls requestUserWithPerms, setTokenExpiry on success', async () => {
    mockFetchSuccess({
      accessTokenExpiration: '2024-05-23T09:47:17.000-04:00',
      refreshTokenExpiration: '2024-05-23T10:07:17.000-04:00',
    });

    await render(<OIDCLanding />);
    screen.getByText('Loading');
    await waitFor(() => expect(mockSetTokenExpiry).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockRequestUserWithPerms).toHaveBeenCalledTimes(1));
    mockFetchCleanUp();
  });

  it('displays an error on failure', async () => {
    mockFetchError('barf');

    await render(<OIDCLanding />);
    await screen.findByText('stripes-core.errors.oidc');
    mockFetchCleanUp();
  });
});
