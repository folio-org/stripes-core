import React from 'react';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import OIDCRedirect from './OIDCRedirect';
import { useStripes } from '../StripesContext';
import { AUTOMATIC_LOGOUT_LOCATION, setUnauthorizedPathToSession } from '../loginServices';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  Redirect: jest.fn(({ children, to }) => {
    return (
      <a href={to} role="button">
        <span>
          {children}
        </span>
      </a>
    );
  }),
  withRouter: (Component) => Component,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(() => ({ search: '?fwd=dashboard' })),
}));

jest.mock('../StripesContext');

describe('OIDCRedirect', () => {
  it('redirects to value from session storage when available', () => {
    const path = '/example';
    useStripes.mockReturnValue({ okapi: { authnUrl: 'http://example.com/authn' } });
    setUnauthorizedPathToSession(path);
    render(<OIDCRedirect />);

    expect(screen.getByRole('button')).toHaveAttribute('href', path);
  });

  it('redirects to URL\'s ?fwd param when available', () => {
    useStripes.mockReturnValue({ okapi: {} });
    render(<OIDCRedirect />);

    expect(screen.getByRole('button')).toHaveAttribute('href', 'dashboard');
  });
});
