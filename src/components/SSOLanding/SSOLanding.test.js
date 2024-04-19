import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { Redirect } from 'react-router';

import {
  Loading,
} from '@folio/stripes-components';

import useSSOSession from './useSSOSession';
import SSOLanding from './SSOLanding';

jest.mock('react-router', () => ({
  Redirect: jest.fn(),
}));

jest.mock('@folio/stripes-components', () => ({
  Loading: jest.fn(),
}));

jest.mock('./useSSOSession', () => jest.fn());

describe('SSOLanding', () => {
  beforeEach(() => {
    Redirect.mockReturnValue('Redirect');
    Loading.mockReturnValue('Loading');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('displays loader when session is set up', () => {
    useSSOSession.mockReturnValue({ isSessionFailed: false });

    render(<SSOLanding />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.queryByText('Redirect')).toBeNull();
  });

  it('redirects to login page when session is not set up', () => {
    useSSOSession.mockReturnValue({ isSessionFailed: true });

    render(<SSOLanding />);

    expect(screen.queryByText('Loading')).toBeNull();
    expect(screen.getByText('Redirect')).toBeInTheDocument();
    expect(Redirect).toHaveBeenCalledWith({ to: '/' }, {});
  });
});
