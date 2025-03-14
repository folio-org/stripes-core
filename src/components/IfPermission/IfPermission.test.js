import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { useStripes } from '../../StripesContext';
import Stripes from '../../Stripes';
import IfPermission from './IfPermission';

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

describe('IfPermission', () => {
  it('returns true if all permissions match', () => {
    useStripes.mockReturnValue(stripes);
    render(<IfPermission perm="john,george">monkey</IfPermission>);
    expect(screen.queryByText(/monkey/)).toBeTruthy();
  });

  it('returns false unless all permissions match', () => {
    useStripes.mockReturnValue(stripes);
    render(<IfPermission perm="john,paul">monkey</IfPermission>);
    expect(screen.queryByText(/monkey/)).toBeFalsy();
  });
});
