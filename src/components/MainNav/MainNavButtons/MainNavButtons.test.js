import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import * as handlerService from '../../../handlerService';
import { ModulesContext } from '../../../ModulesContext';
import { StripesContext } from '../../../StripesContext';
import { MainNavButtons } from './MainNavButtons';

jest.unmock('@folio/stripes-components');

const NOTIFICATIONS_PLUGIN_MODULE = '@folio/ui-plugin';

const STRIPES = {
  config: {},
  connect: (f) => f,
  plugins: {
    notifications: NOTIFICATIONS_PLUGIN_MODULE,
  },
};

const defaultModules = {
  plugin: [],
};

const NotificationPlugin = () => {
  return (
    <>Trigger</>
  );
};

const buildPluginModule = (props) => {
  return {
    pluginType: 'notifications',
    module: NOTIFICATIONS_PLUGIN_MODULE,
    getModule: () => NotificationPlugin,
    ...props,
  };
};

const renderMainNavButtons = (modules = defaultModules, stripes = STRIPES) => render(
  <MainNavButtons />,
  {
    wrapper: ({ children }) => (
      <MemoryRouter>
        <StripesContext.Provider value={stripes}>
          <ModulesContext.Provider value={modules}>
            {children}
          </ModulesContext.Provider>
        </StripesContext.Provider>
      </MemoryRouter>
    ),
  },
);

describe('MainNavButtons', () => {
  let handleEventSpy;

  beforeEach(() => {
    handleEventSpy = jest.spyOn(handlerService, 'handleEvent').mockReturnValue(null);
  });

  afterEach(() => {
    handleEventSpy.mockRestore();
  });

  describe('Help button', () => {
    it('renders the help button', () => {
      renderMainNavButtons();

      expect(screen.getByRole('link', { name: 'stripes-core.help' })).toBeInTheDocument();
    });

    it('uses config.helpUrl when provided', () => {
      renderMainNavButtons(
        defaultModules,
        {
          ...STRIPES,
          config: { helpUrl: 'https://custom-help.example.com' },
        }
      );

      expect(screen.getByRole('link', { name: 'stripes-core.help' })).toHaveAttribute('href', 'https://custom-help.example.com');
    });

    it('falls back to docs.folio.org when helpUrl is not configured', () => {
      renderMainNavButtons();

      expect(screen.getByRole('link', { name: 'stripes-core.help' })).toHaveAttribute('href', 'https://docs.folio.org');
    });
  });

  describe('Notifications plugin', () => {
    it('should NOT render notifications trigger when notifications plugin absent', () => {
      renderMainNavButtons();

      expect(screen.queryByText('Trigger')).not.toBeInTheDocument();
    });

    it('should render notifications trigger via plugin', () => {
      renderMainNavButtons({ plugin: [buildPluginModule()] });

      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });
  });
});