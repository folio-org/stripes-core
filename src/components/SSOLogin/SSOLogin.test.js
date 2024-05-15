import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import SSOLogin from './SSOLogin';

describe('Login via SSO', () => {
  it('renders a button', () => {
    const fx = jest.fn();
    render(<SSOLogin handleSSOLogin={fx} />);
    screen.getByText('stripes-core.loginViaSSO')
  });

  it('calls the callback', async () => {
    const fx = jest.fn();
    render(<SSOLogin handleSSOLogin={fx} />);
    await userEvent.click(screen.getByText('stripes-core.loginViaSSO'));

    expect(fx).toHaveBeenCalled();
  });
});

