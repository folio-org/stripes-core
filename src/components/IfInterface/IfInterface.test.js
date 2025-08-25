import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { useStripes } from '../../StripesContext';
import Stripes from '../../Stripes';
import IfInterface from './IfInterface';

jest.mock('../../StripesContext');
const stripes = new Stripes({
  discovery: {
    interfaces: {
      foo: '1.0'
    }
  },
  logger: {
    log: jest.fn(),
  }
});

// IfInterface is just a component version of Stripes::hasInterface
// See more extensive tests there.
describe('IfInterface', () => {
  it('returns true if interface is present', () => {
    useStripes.mockReturnValue(stripes);
    render(<IfInterface name="foo">monkey</IfInterface>);
    expect(screen.queryByText(/monkey/)).toBeTruthy();
  });

  it('returns false if interface is absent', () => {
    useStripes.mockReturnValue(stripes);
    render(<IfInterface name="paul,is,dead">monkey</IfInterface>);
    expect(screen.queryByText(/monkey/)).toBeFalsy();
  });
});
