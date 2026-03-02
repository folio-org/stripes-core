import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { userEvent } from '@folio/jest-config-stripes/testing-library/user-event';
import { useLocation } from 'react-router';

import Logout from './Logout';
import { useStripes } from '../../StripesContext';
import { getUnauthorizedPathFromSession, logout, setUnauthorizedPathToSession } from '../../loginServices';

jest.mock('../OrganizationLogo');
jest.mock('../../StripesContext');
jest.mock('react-router');
jest.mock('react-query');

jest.mock('../../loginServices', () => ({
  ...jest.requireActual('../../loginServices'),
  logout: jest.fn(() => Promise.resolve()),
}));

const mockBranding = { branding : { logo: { src: './test.png' }, favicon: { src: './test-icon.png' } } };

describe('Logout', () => {
  describe('Direct logout', () => {
    beforeEach(() => {
      const mockUseLocation = useLocation;
      mockUseLocation.mockReturnValue({ pathName: '/logout' });
    });

    it('if not authenticated, renders a logout message', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false }, branding: mockBranding });

      render(<Logout />);
      screen.getByText('stripes-core.logoutComplete');
    });

    it('if authenticated, calls logout then renders a logout message', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: true }, branding: mockBranding });

      render(<Logout />);
      expect(logout).toHaveBeenCalled();
      screen.getByText('stripes-core.logoutComplete');
    });

    it('"log in again" href points to "/"', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false }, branding: mockBranding });

      render(<Logout />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('href', '/');
    });
  });

  describe('Timeout logout', () => {
    beforeEach(() => {
      const mockUseLocation = useLocation;
      mockUseLocation.mockReturnValue({ pathName: '/logout-timeout' });
    });

    describe('if authenticated', () => {
      it('calls logout then renders a timeout message', async () => {
        const mockUseStripes = useStripes;
        mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: true }, branding: mockBranding });

        render(<Logout />);
        expect(logout).toHaveBeenCalled();
        screen.getByText('stripes-core.rtr.idleSession.sessionExpiredSoSad');
      });

      it('"login in again" href points to pre-timeout location', () => {
        const previousPath = '/monkey?bagel';
        setUnauthorizedPathToSession(previousPath);

        const mockUseStripes = useStripes;
        mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false }, branding: mockBranding });

        render(<Logout />);

        expect(screen.getByRole('button')).toHaveAttribute('href', previousPath);
      });

      it('clicking "log in again" clears pre-timeout location from storage', async () => {
        setUnauthorizedPathToSession('/monkey?bagel');

        const user = userEvent.setup();
        const mockUseStripes = useStripes;
        mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false }, branding: mockBranding });

        render(<Logout />);

        await user.click(screen.getByRole('button'));
        expect(getUnauthorizedPathFromSession()).toBeFalsy();
      });
    });

    describe('if not authenticated', () => {
      it('renders a timeout message', async () => {
        const mockUseStripes = useStripes;
        mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false }, branding: mockBranding });

        render(<Logout />);
        screen.getByText('stripes-core.rtr.idleSession.sessionExpiredSoSad');
      });
    });
  });
});
