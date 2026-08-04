import { MemoryRouter } from 'react-router-dom';

import {
  act,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import * as handlerService from '../../../handlerService';
import { ModulesContext } from '../../../ModulesContext';
import { StripesContext } from '../../../StripesContext';
import { MainNavButtons } from './MainNavButtons';

jest.unmock('@folio/stripes-components');

const STRIPES = {
  config: {},
};

const buildModule = (overrides = {}) => ({
  module: 'ui-test',
  displayName: 'Test Module',
  links: {},
  getModule: jest.fn(() => ({})),
  ...overrides,
});

const defaultModules = {
  app: [],
  handler: [],
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
      renderMainNavButtons(defaultModules, { config: { helpUrl: 'https://custom-help.example.com' } });

      expect(screen.getByRole('link', { name: 'stripes-core.help' })).toHaveAttribute('href', 'https://custom-help.example.com');
    });

    it('falls back to docs.folio.org when helpUrl is not configured', () => {
      renderMainNavButtons();

      expect(screen.getByRole('link', { name: 'stripes-core.help' })).toHaveAttribute('href', 'https://docs.folio.org');
    });
  });

  describe('route mode', () => {
    it('renders a nav button linking to the configured route', () => {
      const modules = {
        ...defaultModules,
        app: [buildModule({
          links: {
            mainNavigation: [{ route: '/inventory', icon: 'books', caption: 'stripes-core.test.nav' }],
          },
          getModule: jest.fn(() => ({})),
        })],
      };

      renderMainNavButtons(modules);

      expect(screen.getByRole('link', { name: 'stripes-core.test.nav' })).toBeInTheDocument();
    });
  });

  describe('href mode', () => {
    it('renders a nav button with the configured href', () => {
      const modules = {
        ...defaultModules,
        app: [buildModule({
          links: {
            mainNavigation: [{ href: 'https://example.com', icon: 'external-link', caption: 'stripes-core.test.nav' }],
          },
          getModule: jest.fn(() => ({})),
        })],
      };

      renderMainNavButtons(modules);

      expect(screen.getByRole('link', { name: 'stripes-core.test.nav' })).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('event mode', () => {
    it('calls handleEvent when the button is clicked', async () => {
      const modules = {
        ...defaultModules,
        app: [buildModule({
          links: {
            mainNavigation: [{ event: 'TEST_EVENT', icon: 'flag', caption: 'stripes-core.test.nav' }],
          },
          getModule: jest.fn(() => ({})),
        })],
      };

      renderMainNavButtons(modules);

      const btn = screen.getByRole('button', { name: 'stripes-core.test.nav' });

      await act(() => userEvent.click(btn));

      expect(handleEventSpy).toHaveBeenCalledWith(
        'TEST_EVENT',
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ clickEvent: expect.anything() }),
      );
    });

    it('mounts the handler component returned by handleEvent', async () => {
      const HandlerComponent = () => <div data-testid="handler-output">Handler</div>;
      handleEventSpy.mockReturnValue(HandlerComponent);

      const modules = {
        ...defaultModules,
        app: [buildModule({
          links: {
            mainNavigation: [{ event: 'TEST_EVENT', icon: 'flag', caption: 'stripes-core.test.nav' }],
          },
          getModule: jest.fn(() => ({})),
        })],
      };

      renderMainNavButtons(modules);

      const btn = screen.getByRole('button', { name: 'stripes-core.test.nav' });

      await act(() => userEvent.click(btn));

      expect(screen.getByTestId('handler-output')).toBeInTheDocument();
    });
  });

  describe('render mode', () => {
    it('calls the module render function with renderTrigger and triggerProps', () => {
      const renderFn = jest.fn(() => <div data-testid="custom-render" />);

      const modules = {
        ...defaultModules,
        app: [buildModule({
          links: {
            mainNavigation: [{ render: 'renderCustomFeature', icon: 'flag', caption: 'stripes-core.test.nav' }],
          },
          getModule: jest.fn(() => ({ renderCustomFeature: renderFn })),
        })],
      };

      renderMainNavButtons(modules);

      expect(renderFn).toHaveBeenCalledWith(
        expect.objectContaining({
          renderTrigger: expect.any(Function),
          triggerProps: expect.objectContaining({
            id: expect.any(String),
            ref: expect.any(Object),
          }),
        }),
      );
      expect(screen.getByTestId('custom-render')).toBeInTheDocument();
    });

    it('renderTrigger renders a NavButton with merged extraProps', () => {
      const renderFn = jest.fn(({ renderTrigger }) => {
        return renderTrigger({ 'data-testid': 'trigger-btn', onClick: jest.fn() });
      });

      const modules = {
        ...defaultModules,
        app: [buildModule({
          links: {
            mainNavigation: [{ render: 'renderCustomFeature', icon: 'flag', caption: 'stripes-core.test.nav' }],
          },
          getModule: jest.fn(() => ({ renderCustomFeature: renderFn })),
        })],
      };

      renderMainNavButtons(modules);

      expect(screen.getByTestId('trigger-btn')).toBeInTheDocument();
    });
  });

  describe('visibility check', () => {
    it('renders the button when check returns true', () => {
      const checkFn = jest.fn(() => true);

      const modules = {
        ...defaultModules,
        app: [buildModule({
          links: {
            mainNavigation: [{ route: '/test', icon: 'flag', caption: 'stripes-core.test.nav', check: 'checkVisibility' }],
          },
          getModule: jest.fn(() => ({ checkVisibility: checkFn })),
        })],
      };

      renderMainNavButtons(modules);

      expect(screen.getByRole('link', { name: 'stripes-core.test.nav' })).toBeInTheDocument();
    });

    it('hides the button when check returns false', () => {
      const checkFn = jest.fn(() => false);

      const modules = {
        ...defaultModules,
        app: [buildModule({
          links: {
            mainNavigation: [{ route: '/test', icon: 'flag', caption: 'stripes-core.test.nav', check: 'checkVisibility' }],
          },
          getModule: jest.fn(() => ({ checkVisibility: checkFn })),
        })],
      };

      renderMainNavButtons(modules);

      expect(screen.queryByRole('link', { name: 'stripes-core.test.nav' })).not.toBeInTheDocument();
    });
  });

  describe('deduplication', () => {
    it('renders only one button when the same module appears in multiple module type buckets', () => {
      const mod = buildModule({
        module: 'ui-test',
        links: {
          mainNavigation: [{ route: '/test', icon: 'flag', caption: 'stripes-core.test.nav' }],
        },
        getModule: jest.fn(() => ({})),
      });

      const modules = {
        app: [mod],
        handler: [mod],
      };

      renderMainNavButtons(modules);

      expect(screen.getAllByRole('link', { name: 'stripes-core.test.nav' })).toHaveLength(1);
    });
  });
});
