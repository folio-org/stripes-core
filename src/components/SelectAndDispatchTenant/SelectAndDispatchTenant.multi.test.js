import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
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

jest.mock('../../okapiActions');

describe('SelectAndDispatchTenant', () => {
  describe('multi-tenant', () => {
    it('displays a select field', () => {
      render(<SelectAndDispatchTenant styles={{}} />);
      expect(screen.getByText('stripes-core.tenantChoose')).toBeInTheDocument();
    });

    it('dispatches on-change', async () => {
      const user = userEvent.setup();
      render(<SelectAndDispatchTenant styles={{}} />);
      await user.selectOptions(screen.getByLabelText('stripes-core.tenantChoose'), 'b');
      expect(setOkapiTenant).toHaveBeenCalledWith({ tenant: 'b' });
    });
  });
});

