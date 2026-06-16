import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { useHistory } from 'react-router';

import OIDCLanding from './OIDCLanding';
import useExchangeCode from './useExchangeCode';
import { LOGOUT_MESSAGES } from '../loginServices';

jest.mock('react-router');
jest.mock('../StripesContext', () => ({
  useStripes: () => ({
    okapi: { tenant: 'diku' },
    store: {},
  }),
}));
jest.mock('./useExchangeCode');

describe('OIDCLanding', () => {
  it('displays session-init progress message', () => {
    const history = { push: jest.fn() };
    useHistory.mockReturnValue(history);
    useExchangeCode.mockReturnValue({
      tokenData: true,
      isLoading: false,
      error: null,
    });

    render(<OIDCLanding handleRotation={jest.fn()} />);

    screen.getByText('stripes-core.oidc.initializingSession');
  });

  it('display token-validation progress message', () => {
    const history = { push: jest.fn() };
    useHistory.mockReturnValue(history);
    useExchangeCode.mockReturnValue({
      tokenData: false,
      isLoading: true,
      error: null,
    });

    render(<OIDCLanding handleRotation={jest.fn()} />);

    screen.getByText('stripes-core.oidc.validatingAuthenticationToken');
  });

  it('redirects to /logout when OTP exchange fails', () => {
    const history = { push: jest.fn() };
    useHistory.mockReturnValue(history);
    useExchangeCode.mockReturnValue({
      tokenData: null,
      isLoading: false,
      error: new Error('token exchange failed'),
    });

    render(<OIDCLanding handleRotation={jest.fn()} />);

    expect(history.push).toHaveBeenCalledWith(`/logout?reason=${LOGOUT_MESSAGES.INIT_ERROR}`);
  });
});
