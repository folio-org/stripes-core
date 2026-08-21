import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import AuthenticatedError from './AuthenticatedError';

jest.mock('../../Pluggable', () => (props) => props.children);

describe('AuthenticatedError', () => {
  it('renders general message', () => {
    render(<AuthenticatedError location={{ pathname: '/some-path' }} />);

    screen.getByText('stripes-core.front.error.header');
    screen.getByText('stripes-core.front.error.general.message', { exact: false });
  });

  it('handles /reset-password', () => {
    render(<AuthenticatedError location={{ pathname: '/reset-password' }} />);

    screen.getByText('stripes-core.front.error.header');
    screen.getByText('stripes-core.front.error.setPassword.message');
  });
});
