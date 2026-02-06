import React from 'react';
import { render, screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { okapi } from 'stripes-config';
import EntitlementLoader, { preloadModules, loadModuleAssets } from './EntitlementLoader';
import { StripesContext } from '../StripesContext';
import { ModulesContext, useModules, modulesInitialState as mockModuleInitialState } from '../ModulesContext';
import { loadRemote, registerRemotes } from '@module-federation/runtime';
import { loadEntitlement } from './loadEntitlement';

jest.mock('stripes-config');
jest.mock('./loadEntitlement', () => ({
  loadEntitlement: jest.fn()
}));
jest.mock('../loadRemoteComponent');

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: null,
    };
  }

  componentDidCatch(error) {
    this.setState({ errorMessage: error.toString() });
  }

  render() {
    const { errorMessage } = this.state;
    if (errorMessage) {
      // You can render any custom fallback UI
      return (<span>{errorMessage}</span>);
    }

    return this.props.children;
  }
}

const mockConfigModules = {
  app: [
    {
      name: 'config-app',
      module: 'config-app',
      displayName: 'Config App',
    },
  ],
  plugin: [],
  settings: [],
  handler: [],
};

describe('EntitlementLoader', () => {
  const mockStripes = {
    logger: {
      log: jest.fn((msg, err) => console.log(err)),
    },
    locale: 'en-US',
    okapi: {
      translations: {},
    },
    setTranslations: jest.fn(),
    setLocale: jest.fn(),
    addIcon: jest.fn(),
  };

  const mockRegistry = {
    discovery: [
      {
        name: 'app_module',
        id: 'app_module-1.0.0',
        location: 'http://localhost:3000/remoteEntry.js',
        host: 'localhost',
        port: 3000,
        module: 'app-module',
        displayName: 'appModule.label',
        actsAs: ['app'],
        icons: [{ name: 'icon', title: 'icon title' }],
      },
      {
        name: 'plugin_module',
        location: 'http://localhost:3001/remoteEntry.js',
        id: 'plugin_module-4.0.0',
        host: 'localhost',
        port: 3001,
        module: 'plugin-module',
        displayName: 'pluginModule.label',
        actsAs: ['plugin'],
      },
    ],
  };

  const mockRemotes = mockRegistry.discovery;

  const translations = {
    'testModule.label': 'Test Module Display',
    'appModule.label': 'App Module Display',
    'pluginModule.label': 'Plugin Module Display',
  };

  const TestComponent = ({ children }) => {
    const modules = useModules();
    const noModules = modules === undefined || Object.keys(modules).every(key => modules[key].length === 0);
    if (noModules) {
      return (<div>No Modules</div>);
    }
    return (
      <>
        <div>Modules Loaded</div>
        <ul>
          {Object.keys(modules).map(key => (
            <li key={key}>
              <span>{key}</span>
              <ul>
                {modules[key].map((mod, idx) => (
                  <li key={idx}>{mod.name}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {children}
      </>);
  };

  const TestHarness = ({ children, testStripes = mockStripes, testModulesContext = mockModuleInitialState }) => (
    <ErrorBoundary>
      <ModulesContext.Provider value={testModulesContext}>
        <StripesContext.Provider value={testStripes}>
          <EntitlementLoader>
            <TestComponent>
              {children}
            </TestComponent>
          </EntitlementLoader>
        </StripesContext.Provider>
      </ModulesContext.Provider>
    </ErrorBoundary>
  );

  beforeEach(() => {
    global.fetch = jest.fn();
    loadEntitlement.mockResolvedValueOnce(mockRemotes);
    loadRemoteComponent.mockResolvedValue({ default: {} });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('when discoveryUrl is configured', () => {
    let capturedModules = null;
    const TestContextComponent = () => {
      capturedModules = useModules();
      return null;
    };

    beforeEach(() => {
      capturedModules = null;
      okapi.discoveryUrl = 'http://localhost:8000/entitlement';
      global.fetch = jest.fn();
      // two modules in mock, two calls to fetch translations...
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(translations)
      }).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(translations)
      });
    });

    it('fetches the registry and loads modules dynamically', async () => {
      const discoveryUrl = 'http://localhost:8000/entitlement';
      render(<TestHarness testStripes={{ ...mockStripes, okapi: { discoveryUrl } }} />);

      await waitFor(() => {
        expect(loadEntitlement).toHaveBeenCalledWith(discoveryUrl, new AbortController().signal);
      });
    });

    it('passes dynamic modules to ModulesContext.Provider', async () => {
      render(<TestHarness testStripes={{ ...mockStripes, okapi: { discoveryUrl: 'testdiscoveryUrl' } }} />);

      await waitFor(() => {
        // expect(screen.queryByText('No Modules')).not.toBeInTheDocument();
        expect(screen.getByText('Modules Loaded')).toBeInTheDocument();
        expect(screen.getByText('app')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('merges config modules with dynamically loaded modules', async () => {
      render(
        <TestHarness testModulesContext={mockConfigModules}>
          <TestContextComponent />
        </TestHarness>
      );

      await waitFor(() => {
        expect(capturedModules).not.toBeNull();
        expect(capturedModules.app).toBeDefined();
      });
    });

    it('handles errors during module loading gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        render(
          <TestHarness>
            <div>Content</div>
          </TestHarness>
        );
      } catch (e) {
        await waitFor(() => {
          expect(mockStripes.logger.log).toHaveBeenCalled();
        });
      }
    });
  });

  describe('when discoveryUrl is not configured', () => {
    let capturedModules = null;
    const ContextTestComponent = () => {
      capturedModules = React.useContext(ModulesContext);
      return null;
    };

    beforeEach(() => {
      capturedModules = null;
      okapi.discoveryUrl = undefined;
    });

    it('does not fetch the registry', async () => {
      render(
        <TestHarness>
          <div>Content</div>
        </TestHarness>
      );

      await waitFor(() => {
        expect(loadEntitlement).not.toHaveBeenCalled();
      });
    });

    it('passes through configModules to ModulesContext when no discoveryUrl', async () => {
      render(
        <TestHarness testModulesContext={mockConfigModules}>
          <ContextTestComponent />
        </TestHarness>
      );

      await waitFor(() => {
        expect(capturedModules).toEqual(mockConfigModules);
      });
    });
  });

  describe('children rendering', () => {
    it('renders children when modules are available', async () => {
      okapi.discoveryUrl = undefined;

      render(
        <TestHarness testModulesContext={mockConfigModules}>
          <div>Test Content</div>
        </TestHarness>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });
  });

  describe('preloadModules', () => {
    it('loads remote components and builds module structure', async () => {
      const remotes = [
        {
          name: 'app-module',
          url: 'http://localhost:3000/remoteEntry.js',
          actsAs: ['app'],
        },
        {
          name: 'plugin-module',
          url: 'http://localhost:3001/remoteEntry.js',
          actsAs: ['plugin'],
        },
      ];

      const result = await preloadModules(mockStripes, remotes);

      expect(loadRemoteComponent).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('app');
      expect(result).toHaveProperty('plugin');
      expect(result.app.length).toBe(1);
      expect(result.plugin.length).toBe(1);
    });

    it('assigns getModule function to loaded modules', async () => {
      const remotes = [
        {
          name: 'app-module',
          url: 'http://localhost:3000/remoteEntry.js',
          actsAs: ['app'],
        },
      ];

      const result = await preloadModules(mockStripes, remotes);

      expect(result.app[0]).toHaveProperty('getModule');
      expect(typeof result.app[0].getModule).toBe('function');
    });

    it('handles loading errors gracefully', async () => {
      const remotes = [
        {
          name: 'app-module',
          url: 'http://localhost:3000/remoteEntry.js',
          actsAs: ['app'],
        },
      ];

      loadRemoteComponent.mockRejectedValueOnce(new Error('Load failed'));

      await preloadModules(mockStripes, remotes);

      expect(mockStripes.logger.log).toHaveBeenCalledWith(
        'core',
        expect.stringContaining('Error preloading modules')
      );
    });
  });

  describe('loadModuleAssets', () => {
    const module = {
      name: 'test-module',
      host: 'localhost',
      port: 3000,
      module: 'test-module',
      displayName: 'testModule.label',
      assetPath: 'localhost:3000/path',
      location: 'localhost:3000'
    };

    beforeEach(() => {
      jest.clearAllMocks();
      global.fetch = jest.fn();
    });

    it('loads translations for a module', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(translations),
      });

      const result = await loadModuleAssets(mockStripes, module);

      expect(global.fetch).toHaveBeenCalledWith(
        'localhost:3000/path/translations/en_US.json'
      );
      expect(result.displayName).toBe('Test Module Display');
    });

    it('handles array translation values with messageFormatPattern', async () => {
      const msgFormatTranslations = {
        'testModule.label': [
          { type: 'messageFormatPattern', value: 'Test Module Pattern' },
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(msgFormatTranslations),
      });

      const result = await loadModuleAssets(mockStripes, module);

      expect(result.displayName).toBe('Test Module Pattern');
    });

    it('handles translation fetch errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      try {
        await loadModuleAssets(mockStripes, module);
      } catch (e) {
        expect(mockStripes.logger.log).toHaveBeenCalledWith('core', 'Error loading assets for test-module: Could not load translations for test-module; failed to find localhost:3000/path/translations/en_US.json');
      }
    });

    it('converts kebab-case locale to snake_case for translations', async () => {
      const stripesWithLocale = {
        ...mockStripes,
        locale: 'en-US-u-nu-latn',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ 'testModule.label': 'Test' }),
      });

      await loadModuleAssets(stripesWithLocale, module);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('en_US')
      );
    });

    it('loadEntitlement calls fetch', async () => {
      const actualLoadEntitlement = jest.requireActual('./loadEntitlement').loadEntitlement;
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockRegistry),
      });
      const remotes = await actualLoadEntitlement('okapi:3000');
      expect(fetch).toHaveBeenCalledWith('okapi:3000', { signal: undefined });
      expect(remotes).toEqual(mockRemotes);
    });
  });
});
