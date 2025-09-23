import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { createMemoryHistory } from 'history';

import Harness from '../../test/jest/helpers/harness';
import useOkapiKy from '../useOkapiKy';
import OIDCLanding from './OIDCLanding';

jest.mock('./OrganizationLogo', () => (() => <div>OrganizationLogo</div>));

jest.mock('../useOkapiKy');

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

  it('extracts errors from the authn/token reponse', async () => {
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
    await waitFor(() => {
      screen.getByText(message);
    });
  });
});
