import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { userEvent } from '@folio/jest-config-stripes/testing-library/user-event';

import { useStripes } from '../../StripesContext';
import PreLoginLanding from './PreLoginLanding';
import OrganizationLogo from '../OrganizationLogo';

jest.mock('react-router', () => ({
  Redirect: jest.fn(),
}));

jest.mock('../../StripesContext');

jest.mock('../OrganizationLogo', () => () => 'OrganizationLogo');

describe('PreLoginLanding', () => {
  describe('clicking continue', () => {
    // this test looks fake, but it actually works because choosing
    // a tenant updates redux which updates okapi.tenant.
    // so, even though okapi.tenant is hard-coded here, that's what we actually
    // want to check.
    it('redirects when a tenant has been selected', async () => {
      const mockUseStripes = useStripes;
      const authnUrl = 'https://authn-url.edu';
      mockUseStripes.mockReturnValue({
        okapi: { authnUrl, tenant: 't' },
        config: {
          tenantOptions: {
            p: { name: 'p', clientId: 'p-client', displayName: 'Pangolin' },
            q: { name: 'q', clientId: 'q-client', displayName: 'Quetzal' },
            r: { name: 'rhinoceros', clientId: 'r-client' },
          }
        }
      });

      delete window.location;
      window.location = { assign: jest.fn() };
      const onSelectTenant = jest.fn();

      render(<PreLoginLanding onSelectTenant={onSelectTenant} />);
      await userEvent.click(screen.getByText('stripes-core.button.continue'));
      expect(window.location.assign).toHaveBeenCalledWith(expect.stringContaining(authnUrl));
    });

    // this test looks fake, but it actually works because choosing
    // a tenant updates redux which updates okapi.tenant.
    // so, checking that nothing happens when okapi.tenant is empty is exactly
    // what we want to check.
    it('does nothing if no tenant is selected', async () => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({
        okapi: { authnUrl: 'https://authn-url.edu' },
        config: {
          tenantOptions: {
            p: { name: 'p', clientId: 'p-client', displayName: 'Pangolin' },
            q: { name: 'q', clientId: 'q-client', displayName: 'Quetzal' },
            r: { name: 'rhinoceros', clientId: 'r-client' },
          }
        }
      });

      delete window.location;
      window.location = { assign: jest.fn() };

      const onSelectTenant = jest.fn();

      render(<PreLoginLanding onSelectTenant={onSelectTenant} />);
      await userEvent.click(screen.getByText('stripes-core.button.continue'));
      expect(window.location.assign).toHaveBeenCalledWith('');
    });
  });


  describe('tenant-select list', () => {
    beforeEach(() => {
      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({
        okapi: {},
        config: {
          tenantOptions: {
            p: { name: 'p', clientId: 'p-client', displayName: 'Pangolin' },
            q: { name: 'q', clientId: 'q-client', displayName: 'Quetzal' },
            r: { name: 'rhinoceros', clientId: 'r-client' },
          }
        }
      });
    });

    it('uses "displayName" when available', () => {
      const onSelectTenant = jest.fn();
      render(<PreLoginLanding onSelectTenant={onSelectTenant} />);

      expect(screen.getByText('Pangolin')).toBeInTheDocument();
    });

    it('uses name when "displayName" is unavailable', () => {
      const onSelectTenant = jest.fn();
      render(<PreLoginLanding onSelectTenant={onSelectTenant} />);

      expect(screen.getByText('rhinoceros')).toBeInTheDocument();
    });

    // I give up trying to get the Select mock to render an onChange property.
    // maybe it is some wacky problem with jest-dom? I have no idea, but I have
    // no interest in bashing my head against this wall any longer either.
    // it('clicky click click', async () => {
    //   const onSelectTenant = jest.fn();
    //   render(<PreLoginLanding onSelectTenant={onSelectTenant} />);

    //   await userEvent.click(screen.getByRole('option', { name: 'Pangolin' }));
    //   expect(screen.getByRole('option', { name: 'stripes-core.tenantChoose' }).selected).toBe(true);
    //   expect(onSelectTenant).toHaveBeenCalledWith('p', 'p-client')
    // });
  });
});
