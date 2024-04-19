import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { render } from '@folio/jest-config-stripes/testing-library/react';

import Intl from '../../../../test/jest/helpers/intl';
import { ModulesContext } from '../../../ModulesContext';
import Settings from '../Settings';

jest.unmock('@folio/stripes-components');

const STRIPES = {
  actionNames: [],
  connect: component => component,
  config: {},
  currency: 'USD',
  hasInterface: () => true,
  hasPerm: jest.fn(() => true),
  locale: 'en-US',
  logger: {
    log: () => { },
  },
  okapi: {
    tenant: 'diku',
    url: 'https://folio-testing-okapi.dev.folio.org',
  },
  user: {
    user: {
      consortia: 'old-consortia',
    },
  },
  clone() { return this; },
};

const TestApp = ({ stripes }) => ((
  <div>
    <span>Test app module</span>
    <span>Consortia is {stripes.user.user.consortia}</span>
  </div>
));

const modules = {
  settings: [{
    route: '/test-app',
    displayName: 'Test app',
    module: 'ui-test-app',
    getModule: () => TestApp,
  }],
  handler: [],
};

const getSettings = (props = {}, initialEntries = ['/settings']) => ((
  <MemoryRouter initialEntries={initialEntries}>
    <Intl>
      <ModulesContext.Provider value={modules}>
        <Settings
          stripes={STRIPES}
          {...props}
        />
      </ModulesContext.Provider>
    </Intl>
  </MemoryRouter>
));

const renderSettings = (props, initialEntries) => render(getSettings(props, initialEntries));

describe('Settings', () => {
  it('should render module settings links', () => {
    const { getByRole } = renderSettings();

    expect(getByRole('link', { name: 'Test app' })).toBeDefined();
  });

  describe('when location matches a module route', () => {
    it('should render that module', () => {
      const { getByText } = renderSettings(null, ['/settings/test-app']);

      expect(getByText('Test app module')).toBeDefined();
    });
  });

  describe('when stripes object changes', () => {
    it('should re-render settings with updated stripes object', () => {
      const { rerender, getByText } = renderSettings(null, ['/settings/test-app']);

      expect(getByText('Consortia is old-consortia')).toBeDefined();

      const updatedStripes = {
        ...STRIPES,
        user: {
          user: {
            consortia: 'new-consortia',
          },
        },
      };

      rerender(getSettings({ stripes: updatedStripes }, ['/settings/test-app']));

      expect(getByText('Consortia is new-consortia')).toBeDefined();
    });
  });
});
