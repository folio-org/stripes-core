import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { useStripes } from '../../StripesContext';
import AppConfigError from './AppConfigError';

jest.mock('../../StripesContext');
jest.mock('../OrganizationLogo', () => () => 'OrganizationLogo');

describe('AppConfigError', () => {
  const mockBranding = { branding : { logo: { src: './test.png' }, favicon: { src: './test-icon.png' } } };
  const mockUseStripes = useStripes;
  mockUseStripes.mockReturnValue({ okapi: { isAuthenticated: true }, branding: mockBranding });

  it('displays a warning message', async () => {
    render(<AppConfigError />);

    expect(screen.getByText(/cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/storage/i)).toBeInTheDocument();
  });
});
