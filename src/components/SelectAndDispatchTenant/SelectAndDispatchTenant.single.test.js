import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import SelectAndDispatchTenant from './SelectAndDispatchTenant';

jest.mock('../../StripesContext', () => ({
  useStripes: () => ({ config: { tenantOptions: { t: { name: 't' } } } })
}));

describe('SelectAndDispatchTenant', () => {
  it('single-tenant returns null', async () => {
    render(<SelectAndDispatchTenant styles={{}} />);
    expect(screen.queryByText('tenantChoose')).not.toBeInTheDocument();
  });
});

