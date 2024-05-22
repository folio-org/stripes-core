import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import LogoutTimeout from './LogoutTimeout';
import { useStripes } from '../../StripesContext';


jest.mock('../OrganizationLogo');
jest.mock('../../StripesContext');
jest.mock('react-router', () => ({
  Redirect: () => <div>Redirect</div>,
}));

describe('LogoutTimeout', () => {
  it('if not authenticated, renders a timeout message', async () => {
    const mockUseStripes = useStripes;
    mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false } });

    render(<LogoutTimeout />);
    screen.getByText('stripes-core.rtr.idleSession.sessionExpiredSoSad');
  });

  it('if authenticated, renders a redirect', async () => {
    const mockUseStripes = useStripes;
    mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: true } });

    render(<LogoutTimeout />);
    screen.getByText('Redirect');
  });
});
