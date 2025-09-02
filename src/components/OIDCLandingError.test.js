import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import OIDCLandingError from './OIDCLandingError';

jest.mock('./OrganizationLogo', () => () => 'Logo')

describe('OIDCLandingError', () => {
  it('handles expected error shape', () => {
    const error = {
      errors: [
        {
          message: "To gain a standard for the appreciation of others' work"
        }
      ]

    };
    render(<OIDCLandingError error={error} />);
    expect(screen.getByText(error.errors[0].message)).toBeInTheDocument();
  });

  it('handles unexpected error shape', () => {
    const error = 'And the criticism of your own';
    render(<OIDCLandingError error={error} />);
    expect(screen.getByText(error, { exact: false })).toBeInTheDocument();
  });
});
