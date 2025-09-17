import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';

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
  // sorry eslint; we just gotta mock what the code already does
  // eslint-disable-next-line prefer-promise-reject-errors
  requestUserWithPerms: () => Promise.reject('requestUserWithPerms-error'),
  getOIDCRedirectUri: () => '',
  getLoginTenant: () => 't',
}));

jest.mock('./useExchangeCode');

describe('OIDCLanding', () => {
  it('displays an error on token exchange failure', async () => {
    const error = 'token-exchange-error';
    const mockUseExchangeCode = useExchangeCode;
    mockUseExchangeCode.mockReturnValue({
      data: null,
      isloading: false,
      error,
    });

    render(<OIDCLanding />);

    await waitFor(() => {
      screen.getByText(error);
    });
  });

  it('displays an error on session init failure', async () => {
    const mockUseExchangeCode = useExchangeCode;
    mockUseExchangeCode.mockReturnValue({
      data: { some: 'string' },
      isloading: false,
      error: null,
    });

    render(<OIDCLanding />);
    await waitFor(() => {
      screen.getByText('requestUserWithPerms-error');
    });
  });
});
