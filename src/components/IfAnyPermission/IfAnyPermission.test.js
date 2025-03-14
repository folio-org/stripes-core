import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { useStripes } from '../../StripesContext';
import Stripes from '../../Stripes';
import IfAnyPermission from './IfAnyPermission';

jest.mock('../../StripesContext');
const stripes = new Stripes({
  user: {
    perms: {
      john: true,
      george: true,
      ringo: true,
    }
  },
  logger: {
    log: jest.fn(),
  }
});

describe('IfAnyPermission', () => {
  it('returns true if any permission matches', () => {
    useStripes.mockReturnValue(stripes);
    render(<IfAnyPermission perm="john,paul">monkey</IfAnyPermission>);
    expect(screen.queryByText(/monkey/)).toBeTruthy();
  });

  it('returns false if no permissions match', () => {
    useStripes.mockReturnValue(stripes);
    render(<IfAnyPermission perm="paul,is,dead">monkey</IfAnyPermission>);
    expect(screen.queryByText(/monkey/)).toBeFalsy();
  });
});
