import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import HandlerManager from './HandlerManager';

import { getEventHandlers } from '../../handlerService';

jest.mock('../../handlerService', () => ({
  getEventHandlers: jest.fn(),
}));

let mockModulesProp = {};

jest.mock('../Modules', () => ({
  withModules: (Comp) => (props) => <Comp {...props} modules={mockModulesProp} />,
}));

jest.mock('../ModuleHierarchy', () => ({
  ModuleHierarchyProvider: ({ children }) => <>{children}</>,
}));

const createMockHandlerComponent = (handlerName) => {
  const HandlerComponent = ({ data }) => (
    <div data-testid={`handler-${handlerName}`}>{data?.label || handlerName}</div>
  );
  HandlerComponent.module = { module: { module: handlerName } };
  return HandlerComponent;
};

const getComponent = (props = {}) => <HandlerManager stripes={{}} {...props} />;
const renderComponent = (props = {}) => render(getComponent(props));

describe('HandlerManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModulesProp = { handler: [] };
  });

  it('renders handlers on mount (componentDidMount -> updateComponents)', () => {
    const FirstHandlerComponent = createMockHandlerComponent('First');
    getEventHandlers.mockReturnValue([FirstHandlerComponent]);
    mockModulesProp = { handler: [{}, {}] };

    renderComponent({
      event: 'create',
    });

    expect(getEventHandlers).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('handler-First')).toBeInTheDocument();
  });

  it('updates rendered handlers when modules prop changes (componentDidUpdate)', () => {
    const FirstHandlerComponent = createMockHandlerComponent('First');
    const SecondHandlerComponent = createMockHandlerComponent('Second');
    const props = { event: 'update' };

    getEventHandlers.mockReturnValueOnce([FirstHandlerComponent]);
    mockModulesProp = { handler: [{}] };

    const { rerender } = renderComponent(props);

    expect(screen.getByTestId('handler-First')).toBeInTheDocument();
    expect(getEventHandlers).toHaveBeenCalledTimes(1);

    getEventHandlers.mockReturnValueOnce([FirstHandlerComponent, SecondHandlerComponent]);
    mockModulesProp = { handler: [{}, {}, {}] };

    rerender(getComponent(props));

    expect(screen.getByTestId('handler-First')).toBeInTheDocument();
    expect(screen.getByTestId('handler-Second')).toBeInTheDocument();
    expect(getEventHandlers).toHaveBeenCalledTimes(2);
  });
});
