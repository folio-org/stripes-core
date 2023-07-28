import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ModulesContext } from '../../../ModulesContext';
import TestComponent from './ProfileDropdown';

jest.unmock('@folio/stripes-components');
jest.mock('currency-codes/data', () => ({ filter: () => [] }));

const checkAction = jest.fn(() => true);
const eventHandler = jest.fn(() => 'Handler content');
const modules = {
  app: [
    {
      displayName: 'Test app',
      handlerName: 'eventHandler',
      route: '/test',
      links: {
        userDropdown: [{
          event: 'TEST_EVENT',
          caption: 'Profile dropdown action',
          check: 'checkAction',
        }]
      },
      getModule: jest.fn(() => ({
        checkAction,
        eventHandler,
      })),
    },
  ],
};

const tenant = 'test';
const stripes = {
  user: {
    user: {
      id: 'user-id',
      tenants: [{
        id: tenant,
        name: 'Central office',
      }]
    },
  },
  okapi: {
    tenant,
  },
};

const defaultProps = {
  onLogout: jest.fn(),
  stripes,
};

const wrapper = ({ children }) => (
  <MemoryRouter>
    <ModulesContext.Provider value={modules}>
      {children}
    </ModulesContext.Provider>
  </MemoryRouter>
);

const renderProfileDropdown = (props = {}) => render(
  <TestComponent
    {...defaultProps}
    {...props}
  />,
  { wrapper },
);

describe('ProfileDropdown', () => {
  it('should display current consortium (if enabled) in the dropdown trigger', () => {
    renderProfileDropdown();

    expect(screen.getByText('Central office')).toBeInTheDocument();
  });

  it('should display module profile dropdown item', () => {
    renderProfileDropdown();

    expect(checkAction).toBeCalled();
    expect(screen.getByText('Profile dropdown action')).toBeInTheDocument();
  });
});
