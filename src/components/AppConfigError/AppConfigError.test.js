import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import AppConfigError from './AppConfigError';

jest.mock('../OrganizationLogo', () => () => 'OrganizationLogo');
describe('AppConfigError', () => {
  it('displays a warning message', async () => {
    render(<AppConfigError />);

    expect(screen.getByText(/cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/storage/i)).toBeInTheDocument();
  });
});
