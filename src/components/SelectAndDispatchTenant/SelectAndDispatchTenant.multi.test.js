import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { userEvent } from '@folio/jest-config-stripes/testing-library/user-event';

import { setOkapiTenant } from '../../okapiActions';
import SelectAndDispatchTenant from './SelectAndDispatchTenant';

jest.mock('../../StripesContext', () => ({
  useStripes: () => ({
    store: { dispatch: jest.fn() },
    config: {
      tenantOptions: {
        a: { name: 'a', displayName: 'Althea' },
        b: { name: 'b', displayName: 'Bernice' },
        c: { name: 'c', displayName: 'Claudia' },
      }
    }
  })
}));

// Mock the entitlement service to return tenant options
jest.mock('../../entitlementService', () => ({
  getTenantOptions: jest.fn().mockResolvedValue({
    a: { name: 'a', displayName: 'Althea' },
    b: { name: 'b', displayName: 'Bernice' },
    c: { name: 'c', displayName: 'Claudia' },
  })
}));

jest.mock('../../okapiActions');

describe('SelectAndDispatchTenant', () => {
  describe('multi-tenant', () => {
    it('displays a select field', async () => {
      render(<SelectAndDispatchTenant styles={{}} />);
      await waitFor(() => {
        expect(screen.getByText('stripes-core.tenantChoose')).toBeInTheDocument();
      });
    });

    it('dispatches on-change', async () => {
      const user = userEvent.setup();
      render(<SelectAndDispatchTenant styles={{}} />);
      
      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByLabelText('stripes-core.tenantChoose')).toBeInTheDocument();
      });
      
      await user.selectOptions(screen.getByLabelText('stripes-core.tenantChoose'), 'b');
      expect(setOkapiTenant).toHaveBeenCalledWith({ tenant: 'b' });
    });
  });
});

