import { render } from '@folio/jest-config-stripes/testing-library/react';

import withLastVisited from './withLastVisited';
import LastVisitedContext from './LastVisitedContext';

let mockModulesData = {};
let listeners = [];

const mockHistory = {
  listen: (fn) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }
};

jest.mock('react-router', () => ({
  withRouter: (Comp) => (props) => {
    return <Comp {...props} history={mockHistory} />;
  }
}));

jest.mock('../Modules', () => ({
  withModules: (Comp) => (props) => <Comp {...props} modules={mockModulesData} />,
}));

const Component = ({ onRender }) => (
  <LastVisitedContext.Consumer>
    {({ lastVisited, cachePreviousUrl }) => {
      onRender({ lastVisited, cachePreviousUrl });
      return null;
    }}
  </LastVisitedContext.Consumer>
);

const Wrapped = withLastVisited(Component);

const getComponent = (props = {}) => <Wrapped {...props} />;
const renderComponent = (props = {}) => render(getComponent(props));

describe('withLastVisited', () => {
  beforeEach(() => {
    listeners = [];
    mockModulesData = { app: [] };
  });

  it('updates lastVisited during componentDidMount via history.listen', () => {
    mockModulesData = {
      app: [
        { route: '/users', module: '@folio/users' },
      ]
    };

    const renders = [];
    const handleRender = (ctx) => { renders.push(ctx); };

    renderComponent({ onRender: handleRender });

    // Simulate navigation events that history.listen would provide.
    listeners.forEach(l => l({ pathname: '/users', search: '' }));
    listeners.forEach(l => l({ pathname: '/users/view/1', search: '?layer=edit' }));

    const lastCtx = renders.at(-1);
    expect(lastCtx.lastVisited.users).toBe('/users/view/1?layer=edit');
  });

  it('updates module list in componentDidUpdate and preserves previous lastVisited via cachePreviousUrl', () => {
    mockModulesData = { app: [{ route: '/inventory', module: '@folio/inventory' }] };
    const renders = [];
    const handleRender = (ctx) => { renders.push(ctx); };

    const { rerender } = renderComponent({ onRender: handleRender });

    listeners.forEach(l => l({ pathname: '/inventory', search: '' }));
    listeners.forEach(l => l({ pathname: '/inventory/view/uuid', search: '' }));

    // trigger cachePreviousUrl to store previous location
    const latest = renders.at(-1);
    latest.cachePreviousUrl();

    mockModulesData = { app: [{ route: '/inventory', module: '@folio/inventory' }, { route: '/orders', module: '@folio/orders' }] };
    rerender(getComponent({ onRender: handleRender }));

    listeners.forEach(l => l({ pathname: '/orders', search: '' }));

    const finalCtx = renders.at(-1);

    expect(finalCtx.lastVisited.inventory).toBe('/inventory');
    expect(finalCtx.lastVisited.orders).toBe('/orders');
  });
});
