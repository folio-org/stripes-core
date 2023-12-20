import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import stripesConnect from '../../stripesConnect';

import AboutEnabledModules from './AboutEnabledModules';

jest.mock('../../stripesConnect', () => (Component) => Component);

describe('AboutEnabledModules', () => {
  it('displays application version details', async () => {
    const availableModules = {
      amy: 'angelo',
      beth: 'baldwin',
      camilla: 'claude'
    };
    const resources = {
      enabledModules: {
        records: [
          { id: 'amy' },
          { id: 'beth' },
        ]
      }
    };
    const tenantid = 'monkey';

    render(<AboutEnabledModules
      availableModules={availableModules}
      resources={resources}
      tenantid={tenantid}
    />);

    Object.keys(availableModules).forEach((i) => {
      expect(screen.getByText(availableModules[i])).toBeInTheDocument();
    });
  });
});
