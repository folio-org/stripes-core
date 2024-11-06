import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { useLocation } from 'react-router';

import Logout from './Logout';
import { useStripes } from '../../StripesContext';
import { logout } from '../../loginServices';

jest.mock('../OrganizationLogo');
jest.mock('../../StripesContext');
jest.mock('react-router');

jest.mock('../../loginServices', () => ({
  logout: jest.fn(() => Promise.resolve()),
}));

describe('Logout', () => {
  describe('Direct logout', () => {
    beforeEach(() => {
      const mockUseLocation = useLocation;
      mockUseLocation.mockReturnValue({ pathName: '/logout' });
    });

    it('if not authenticated, renders a logout message', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false } });

      render(<Logout />);
      screen.getByText('stripes-core.logoutComplete');
    });

    it('if authenticated, calls logout then renders a logout message', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: true } });

      render(<Logout />);
      expect(logout).toHaveBeenCalled();
      screen.getByText('stripes-core.logoutComplete');
    });
  });

  describe('Timeout logout', () => {
    beforeEach(() => {
      const mockUseLocation = useLocation;
      mockUseLocation.mockReturnValue({ pathName: '/logout-timeout' });
    });

    it('if not authenticated, renders a timeout message', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false } });

      render(<Logout />);
      screen.getByText('stripes-core.rtr.idleSession.sessionExpiredSoSad');
    });

    it('if authenticated, calls logout then renders a timeout message', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: true } });

      render(<Logout />);
      expect(logout).toHaveBeenCalled();
      screen.getByText('stripes-core.rtr.idleSession.sessionExpiredSoSad');
    });
  });
});
