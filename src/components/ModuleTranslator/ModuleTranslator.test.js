import { IntlProvider } from 'react-intl';

import { render, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import ModuleTranslator from './ModuleTranslator';
import { ModulesContext } from '../../ModulesContext';
import { getModules } from '../../entitlementService';

jest.mock('../../entitlementService', () => ({
  getModules: jest.fn(),
}));

const defaultMessages = {
  'app.label': 'App Label',
  'plugin.label': 'Plugin Label',
  'settings.label': 'Settings Label',
  'handler.label': 'Handler Label',
};
const renderWithIntl = ({
  ui,
  messages = defaultMessages,
} = {}) => render(
  <ModuleTranslator>
    <ModulesContext.Consumer>
      {({ app, plugin, settings, handler }) => (
        <IntlProvider
          locale="en"
          messages={messages}
        >
          {ui || (
            <div>
              <div data-testid="app-name">{app[0]?.displayName}</div>
              <div data-testid="plugin-name">{plugin[0]?.displayName}</div>
              <div data-testid="settings-name">{settings[0]?.displayName}</div>
              <div data-testid="handler-name">{handler[0]?.displayName}</div>
            </div>
          )}
        </IntlProvider>
      )}
    </ModulesContext.Consumer>
  </ModuleTranslator>
);

describe('ModuleTranslator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('assigns displayName from formatMessage call', async () => {
    getModules.mockResolvedValueOnce({
      app: [{ id: 'a1', displayName: 'app.label' }],
      plugin: [{ id: 'p1', displayName: 'plugin.label' }],
      settings: [{ id: 's1', displayName: 'settings.label' }],
      handler: [{ id: 'h1', displayName: 'handler.label' }],
    });

    const { getByTestId } = renderWithIntl();

    await waitFor(() => {
      expect(getByTestId('app-name').textContent).toBe('app.label');
      expect(getByTestId('plugin-name').textContent).toBe('plugin.label');
      expect(getByTestId('settings-name').textContent).toBe('settings.label');
      expect(getByTestId('handler-name').textContent).toBe('handler.label');
    });
  });

  it('leaves displayName undefined when original module has no displayName field', async () => {
    getModules.mockResolvedValueOnce({ app: [{ id: 'a1' }] });

    const { getByTestId } = renderWithIntl();

    await waitFor(() => {
      expect(getByTestId('app-name').textContent).toBe('');
    });
  });
});
