import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import AboutUIDependencies from './AboutUIDependencies';

describe('AboutUIDependencies', () => {
  const modules = {
    app: [
      {
        module: 'app-alpha',
        version: '1.2.3',
        okapiInterfaces: {
          iAlpha: '1.0',
        }
      },
      { module: 'app-beta', version: '2.3.4' }
    ],
    settings: [
      { module: 'settings-alpha', version: '3.4.5' },
      { module: 'settings-beta', version: '4.5.6' }
    ],
    plugin: [
      { module: 'plugin-alpha', version: '5.6.7' },
      { module: 'plugin-beta', version: '6.7.8' }
    ],
    typeThatHasNotBeenInventedYet: [
      { module: 'typeThatHasNotBeenInventedYet-alpha', version: '7.8.9' },
      { module: 'typeThatHasNotBeenInventedYet-beta', version: '8.9.10' }
    ],
  };

  it('displays UI module details', async () => {
    render(<AboutUIDependencies modules={modules} />);

    expect(screen.queryByText(/about.noDependencies/)).toBe(null);
    expect(screen.queryByText(/iAlpha/)).toBe(null);

    Object.keys(modules).forEach((i) => {
      modules[i].forEach((j) => {
        expect(screen.getByText(j.module, { exact: false })).toBeInTheDocument();
        expect(screen.getByText(j.version, { exact: false })).toBeInTheDocument();
      });
    });
  });

  it('displays required interfaces', async () => {
    render(<AboutUIDependencies modules={modules} showDependencies />);

    expect(screen.getAllByText(/about.noDependencies/).length).toBeGreaterThan(1);
    expect(screen.getByText(/iAlpha/)).toBeInTheDocument();
  });
});
