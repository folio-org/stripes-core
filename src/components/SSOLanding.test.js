import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { requestUserWithPerms } from '../loginServices';

import SSOLanding from './SSOLanding';

jest.mock('lodash', () => ({
  debounce: jest.fn(fn => fn)
}));

jest.mock('../loginServices', () => ({
  requestUserWithPerms: jest.fn(() => {})
}));

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn()
}));

jest.mock('stripes-config', () => ({
  okapi: {
    url: 'okapiUrl',
    tenant: 'okapiTenant'
  }
}),
{ virtual: true });

jest.mock('react-cookie', () => ({
  useCookies: jest.fn()
}));

jest.mock('react-redux', () => ({
  useStore: jest.fn()
}));

describe('SSOLanding', () => {
  beforeEach(() => {
    useLocation.mockImplementation(() => ({ search: '' }));
    useCookies.mockImplementation(() => [{}]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('handles token within query parameters', () => {
    it('processes login', () => {
      useLocation.mockImplementation(() => ({ search: 'ssoToken=c0ffee' }));
      render(<SSOLanding />);
      expect(requestUserWithPerms.mock.calls).toHaveLength(1);
      expect(screen.getByText(/Logged in with token.*param\.$/)).toBeInTheDocument();
    });
  });

  describe('handles token within a cookie', () => {
    it('processes login', () => {
      useCookies.mockImplementation(() => ([{ ssoToken: 'c0ffee-c0ffee' }]));
      render(<SSOLanding />);
      expect(requestUserWithPerms.mock.calls).toHaveLength(1);
      expect(screen.getByText(/Logged in with token.*cookie\.$/)).toBeInTheDocument();
    });
  });

  describe('displays error with no token.', () => {
    it('processes login', () => {
      render(<SSOLanding />);
      expect(requestUserWithPerms.mock.calls).toHaveLength(0);
      expect(screen.getByText('No cookie or query parameter')).toBeInTheDocument();
    });
  });
});
