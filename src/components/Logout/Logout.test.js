import { act, render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { userEvent } from '@folio/jest-config-stripes/testing-library/user-event';
import { useLocation } from 'react-router';

import Logout from './Logout';
import { useLogoutQuery } from './useLogoutQuery';
import { useStripes } from '../../StripesContext';
import {
  LOGOUT_MESSAGES,
  getUnauthorizedPathFromSession,
  setUnauthorizedPathToSession
} from '../../loginServices';

jest.mock('./useLogoutQuery');
jest.mock('../OrganizationLogo');
jest.mock('../../StripesContext');
jest.mock('react-router');
jest.mock('react-query');

jest.mock('../../loginServices', () => ({
  ...jest.requireActual('../../loginServices'),
  logout: jest.fn(() => Promise.resolve()),
  getLogoutTenant: jest.fn(() => ({ tenantId: 'tenant' })),
}));

const mockBranding = { branding: { logo: { src: './test.png' }, favicon: { src: './test-icon.png' } } };

describe('Logout', () => {
  describe('Direct logout', () => {
    beforeEach(() => {
      const mockUseLocation = useLocation;
      mockUseLocation.mockReturnValue({ pathname: '/logout' });
    });

    it('if not authenticated, renders a logout message', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false }, branding: mockBranding });

      render(<Logout sessionTimeoutTimer={{ clear: jest.fn() }} sessionTimeoutWarningTimer={{ clear: jest.fn() }} />);
      screen.getByText('stripes-core.logoutComplete');
    });

    it('if authenticated, calls useLogoutQuery and renders loading dots ...', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({
        branding: mockBranding,
        okapi: { isAuthenticated: true },
      });

      const mockUseLogoutQuery = useLogoutQuery;
      mockUseLogoutQuery.mockReturnValue({});

      act(() => {
        render(<Logout sessionTimeoutTimer={{ clear: jest.fn() }} sessionTimeoutWarningTimer={{ clear: jest.fn() }} />);
      });
      waitFor(() => {
        expect(mockUseLogoutQuery).toHaveBeenCalled();
        screen.getByText('LoadingView');
      });
    });

    it('"log in again" href points to "/"', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false }, branding: mockBranding });

      render(<Logout sessionTimeoutTimer={{ clear: jest.fn() }} sessionTimeoutWarningTimer={{ clear: jest.fn() }} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('href', '/');
    });
  });

  describe('Timeout logout', () => {
    beforeEach(() => {
      const mockUseLocation = useLocation;
      mockUseLocation.mockReturnValue({
        pathname: '/logout',
        search: `?reason=${LOGOUT_MESSAGES.INACTIVITY}`,
      });
    });

    it('if not authenticated, renders a timeout message', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false }, branding: mockBranding });

      render(<Logout sessionTimeoutTimer={{ clear: jest.fn() }} sessionTimeoutWarningTimer={{ clear: jest.fn() }} />);
      screen.getByText('stripes-core.rtr.idleSession.sessionExpiredSoSad');
    });

    it('if authenticated, calls useLogoutQuery and renders waiting dots ...', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({
        branding: mockBranding,
        okapi: { isAuthenticated: true },
      });

      const mockUseLogoutQuery = useLogoutQuery;
      mockUseLogoutQuery.mockReturnValue({});

      act(() => {
        render(<Logout sessionTimeoutTimer={{ clear: jest.fn() }} sessionTimeoutWarningTimer={{ clear: jest.fn() }} />);
      });
      await waitFor(async () => {
        expect(mockUseLogoutQuery).toHaveBeenCalled();
        screen.getByText('LoadingView');
      });
    });

    it('"login in again" href points to pre-timeout location', () => {
      const previousPath = '/monkey?bagel';
      setUnauthorizedPathToSession(previousPath);

      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false }, branding: mockBranding });

      render(<Logout sessionTimeoutTimer={{ clear: jest.fn() }} sessionTimeoutWarningTimer={{ clear: jest.fn() }} />);

      expect(screen.getByRole('button')).toHaveAttribute('href', previousPath);
    });

    it('clicking "log in again" clears pre-timeout location from storage', async () => {
      setUnauthorizedPathToSession('/monkey?bagel');

      const user = userEvent.setup();
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: false }, branding: mockBranding });

      render(<Logout sessionTimeoutTimer={{ clear: jest.fn() }} sessionTimeoutWarningTimer={{ clear: jest.fn() }} />);

      await user.click(screen.getByRole('button'));
      expect(getUnauthorizedPathFromSession()).toBeFalsy();
    });
  });
});
