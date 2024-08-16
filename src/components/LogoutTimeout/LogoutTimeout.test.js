import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { userEvent } from '@folio/jest-config-stripes/testing-library/user-event';


import LogoutTimeout from './LogoutTimeout';
import { useStripes } from '../../StripesContext';
import { getUnauthorizedPathFromSession, setUnauthorizedPathToSession } from '../../loginServices';


jest.mock('../OrganizationLogo');
jest.mock('../../StripesContext');
jest.mock('react-router', () => ({
  Redirect: () => <div>Redirect</div>,
}));

describe('LogoutTimeout', () => {
  describe('if not authenticated', () => {
    it('renders a timeout message', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false } });

      render(<LogoutTimeout />);
      screen.getByText('stripes-core.rtr.idleSession.sessionExpiredSoSad');
    });

    it('clears previous path from storage after clicking', async () => {
      const previousPath = '/monkey?bagel';
      setUnauthorizedPathToSession(previousPath);
      const user = userEvent.setup();
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false } });

      render(<LogoutTimeout />);

      await user.click(screen.getByRole('button'));

      expect(getUnauthorizedPathFromSession()).toBe(null);
    });
  });

  it('if authenticated, renders a redirect', async () => {
    const mockUseStripes = useStripes;
    mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: true } });

    render(<LogoutTimeout />);
    screen.getByText('Redirect');
  });
});
