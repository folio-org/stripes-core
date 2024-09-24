import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { useStripes } from '../../StripesContext';
import AboutAPIGateway from './AboutAPIGateway';

jest.mock('../../StripesContext');

describe('AboutAPIGateway', () => {
  it('displays API gateway details', async () => {
    const okapi = {
      tenant: 'barbie',
      url: 'https://oppie.com'
    };

    const mockUseStripes = useStripes;
    mockUseStripes.mockReturnValue({ okapi });

    render(<AboutAPIGateway />);

    expect(screen.getByText(/about.version/)).toBeInTheDocument();
    expect(screen.getByText(/about.forTenant/)).toBeInTheDocument();
    expect(screen.getByText(/about.onUrl/)).toBeInTheDocument();
  });
});
