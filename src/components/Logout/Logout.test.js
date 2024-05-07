import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
// import { createRef } from 'react';
// import { Redirect } from 'react-router';

import Harness from '../../../test/jest/helpers/harness';
import Logout from './Logout';
import { logout } from '../../loginServices';

jest.mock('../../loginServices', () => ({
  ...(jest.requireActual('../../loginServices')),
  getLocale: () => Promise.resolve(),
  logout: jest.fn()
}));

jest.mock('react-router', () => ({
  ...(jest.requireActual('react-router')),
  Redirect: () => <div>Redirect</div>
}));

// import { getLocale, logout } from '../../loginServices';


const stripes = {
  config: {
    rtr: {
      idleModalTTL: '3s',
      idleSessionTTL: '3s',
    }
  },
  okapi: {
    url: 'https://blah',
  },
  logger: { log: jest.fn() },
  store: {
    getState: jest.fn(),
  },
};

describe('Logout', () => {
  it('calls logout and redirects', async () => {
    logout.mockReturnValue(Promise.resolve());

    render(<Harness stripes={stripes}><Logout /></Harness>);

    await waitFor(() => {
      screen.getByText('Redirect');
    });

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
