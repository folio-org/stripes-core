import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import AboutStripes from './AboutStripes';

jest.mock('@folio/stripes-connect/package', () => ({ version: '1.2.3' }));
jest.mock('@folio/stripes-components/package', () => ({ version: '4.5.6' }));
jest.mock('@folio/stripes-logger/package', () => ({ version: '7.8.9' }));
jest.mock('../../../package', () => ({ version: '10.11.12' }));

describe('AboutStripes', () => {
  it('displays stripes-* version details', async () => {
    render(<AboutStripes />);

    expect(screen.getByText(/about.userInterface/)).toBeInTheDocument();
    expect(screen.getByText(/about.foundation/)).toBeInTheDocument();

    expect(screen.getByText(/stripes-core 10.11.12/)).toBeInTheDocument();
    expect(screen.getByText(/stripes-connect 1.2.3/)).toBeInTheDocument();
    expect(screen.getByText(/stripes-components 4.5.6/)).toBeInTheDocument();
    expect(screen.getByText(/stripes-logger 7.8.9/)).toBeInTheDocument();
  });
});

