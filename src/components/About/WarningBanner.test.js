import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import WarningBanner from './WarningBanner';

describe('WarningBanner', () => {
  const modules = {
    app: [
      {
        module: 'app-alpha',
        version: '1.2.3',
        okapiInterfaces: {
          alpha: '1.0',
          beta: '2.0',
          gamma: '3.1',
        }
      },
      { module: 'app-beta', version: '2.3.4' }
    ],
  };

  it('displays missing interfaces', async () => {
    const interfaces = {
      alpha: '1.0',
      beta: '2.0',
    };

    render(<WarningBanner interfaces={interfaces} modules={modules} />);

    expect(screen.getByText(/about.missingModuleCount/)).toBeInTheDocument();
    expect(screen.getByText(/gamma/)).toBeInTheDocument();
  });

  it('displays incompatible interfaces', async () => {
    const interfaces = {
      alpha: '1.0',
      beta: '2.0',
      gamma: '3.0',
    };
    render(<WarningBanner interfaces={interfaces} modules={modules} />);

    expect(screen.getByText(/about.incompatibleModuleCount/)).toBeInTheDocument();
    expect(screen.getByText(/gamma/)).toBeInTheDocument();
  });
});
