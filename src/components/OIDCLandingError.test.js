import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import OIDCLandingError from './OIDCLandingError';

jest.mock('./OrganizationLogo', () => () => 'Logo');

describe('OIDCLandingError', () => {
  describe('displays supplied errors', () => {
    it('given an API error response in the expected shape', () => {
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

    it('given a string', () => {
      const error = 'And the criticism of your own';
      render(<OIDCLandingError error={error} />);
      expect(screen.getByText(error, { exact: false })).toBeInTheDocument();
    });

    it('given an Error object', () => {
      const error = new Error("to carry the keys of the world's library in your pocket,");
      render(<OIDCLandingError error={error} />);
      expect(screen.getByText(error.message, { exact: false })).toBeInTheDocument();
    });
  });

  describe('displays only the generic message given other input', () => {
    it('given input in an unsupported/unexpected format', () => {
      const genericError = 'stripes-core.errors.oidc';
      const error = ['and feel its resources behind you in whatever task you undertake;'];

      render(<OIDCLandingError error={error} />);
      expect(screen.queryByText(error[0])).not.toBeInTheDocument();
      expect(screen.getByText(genericError, { exact: false })).toBeInTheDocument();
    });

    it('given nothing', () => {
      const genericError = 'stripes-core.errors.oidc';
      render(<OIDCLandingError />);
      expect(screen.getByText(genericError, { exact: false })).toBeInTheDocument();
    });
  });
});
