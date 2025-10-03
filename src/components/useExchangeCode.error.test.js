import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { createMemoryHistory } from 'history';

import Harness from '../../test/jest/helpers/harness';
import useOkapiKy from '../useOkapiKy';
import {
  setTokenExpiry,
} from '../loginServices';
import OIDCLanding from './OIDCLanding';


jest.mock('./OrganizationLogo', () => (() => <div>OrganizationLogo</div>));

jest.mock('../useOkapiKy');

jest.mock('../loginServices', () => ({
  ...(jest.requireActual('../loginServices')),
  // eslint-disable-next-line no-throw-literal
  setTokenExpiry: jest.fn(() => Promise.resolve(() => { throw 'boom'; })),
  requestUserWithPerms: jest.fn(() => Promise.resolve()),
  storeLogoutTenant: jest.fn(() => Promise.resolve()),
}));

describe('useExchangeCode', () => {
  it('captures errors from the callback', async () => {
    window.location.pathname = '/some-path';
    window.location.search = '?code=code';

    const stripes = {
      config: {},
      hasPerm: jest.fn(),
      okapi: {},
    };
    const history = createMemoryHistory();
    const mockUseOkapiKy = useOkapiKy;
    mockUseOkapiKy.mockReturnValue(() => ({
      json: () => ({ some: 'object' })
    }));

    render(<Harness history={history} stripes={stripes}><OIDCLanding /></Harness>);
    waitFor(() => {
      expect(setTokenExpiry).toHaveBeenCalled();
    });
    screen.findByText('boom');
  });
});
