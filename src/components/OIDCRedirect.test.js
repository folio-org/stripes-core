import React from 'react';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import OIDCRedirect from './OIDCRedirect';
import { useStripes } from '../StripesContext';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  Redirect: () => <div>internalredirect</div>,
  withRouter: Component => Component,
  useLocation: () => ({
    search: '?fwd=/dashboard',
  }),
}));

jest.mock('../StripesContext');

describe('OIDCRedirect', () => {
  beforeAll(() => {
    sessionStorage.setItem(
      'unauthorized_path',
      '/example'
    );
  });

  afterAll(() => sessionStorage.removeItem('unauthorized_path'));

  it('redirects to value from session storage under unauthorized_path key', () => {
    useStripes.mockReturnValue({ okapi: { authnUrl: 'http://example.com/authn' }, config: {} });
    render(<OIDCRedirect />);

    expect(screen.getByText(/internalredirect/)).toBeInTheDocument();
  });

  it('redirects fwd if no authn provided to stripes okapi config', () => {
    useStripes.mockReturnValue({ okapi: { }, config: {} });
    render(<OIDCRedirect />);

    expect(screen.getByText(/internalredirect/)).toBeInTheDocument();
  });
});
