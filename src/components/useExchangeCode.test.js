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
  setTokenExpiry: jest.fn(() => Promise.resolve()),
  requestUserWithPerms: jest.fn(() => Promise.resolve()),
  storeLogoutTenant: jest.fn(() => Promise.resolve()),
}));

describe('useExchangeCode', () => {
  it('errors when code is missing from window.location.search', async () => {
    const stripes = {
      config: {},
      hasPerm: jest.fn(),
      okapi: {},
    };
    const history = createMemoryHistory();

    render(<Harness history={history} stripes={stripes}><OIDCLanding /></Harness>);
    await screen.findByText('stripes-core.errors.oidc');
  });

  it('extracts JSON errors from the authn/token reponse', async () => {
    window.location.pathname = '/some-path';
    window.location.search = '?code=code';

    const message = 'I am nobody; who are you?';
    const error = {
      response: {
        json: () => Promise.resolve({ errors: [{ message }] })
      }
    };

    const stripes = {
      config: {},
      hasPerm: jest.fn(),
      okapi: {},
    };
    const history = createMemoryHistory();
    const mockUseOkapiKy = useOkapiKy;
    mockUseOkapiKy.mockReturnValue(() => ({
      json: () => { throw error; }
    }));

    render(<Harness history={history} stripes={stripes}><OIDCLanding /></Harness>);
    screen.findByText(message);
  });

  it('extracts plaintext errors from the authn/token reponse', async () => {
    window.location.pathname = '/some-path';
    window.location.search = '?code=code';

    const message = 'I am nobody; who are you?';

    const stripes = {
      config: {},
      hasPerm: jest.fn(),
      okapi: {},
    };
    const history = createMemoryHistory();
    const mockUseOkapiKy = useOkapiKy;
    mockUseOkapiKy.mockReturnValue(() => ({
      json: () => { throw message; }
    }));

    render(<Harness history={history} stripes={stripes}><OIDCLanding /></Harness>);
    screen.findByText(message);
  });

  it('executes the callback when token exchange succeeds', async () => {
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
  });
});
