import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import HandlerManager from './HandlerManager';

import { invokeEventHandlers } from '../../handlerService';

jest.mock('../../handlerService', () => ({
  invokeEventHandlers: jest.fn(),
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
    invokeEventHandlers.mockReturnValue([FirstHandlerComponent]);
    mockModulesProp = { handler: [{}, {}] };

    renderComponent({
      event: 'create',
    });

    expect(invokeEventHandlers).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('handler-First')).toBeInTheDocument();
  });

  it('updates rendered handlers when modules prop changes (componentDidUpdate)', () => {
    const FirstHandlerComponent = createMockHandlerComponent('First');
    const SecondHandlerComponent = createMockHandlerComponent('Second');
    const props = { event: 'update' };

    invokeEventHandlers.mockReturnValueOnce([FirstHandlerComponent]);
    mockModulesProp = { handler: [{}] };

    const { rerender } = renderComponent(props);

    expect(screen.getByTestId('handler-First')).toBeInTheDocument();
    expect(invokeEventHandlers).toHaveBeenCalledTimes(1);

    invokeEventHandlers.mockReturnValueOnce([FirstHandlerComponent, SecondHandlerComponent]);
    mockModulesProp = { handler: [{}, {}, {}] };

    rerender(getComponent(props));

    expect(screen.getByTestId('handler-First')).toBeInTheDocument();
    expect(screen.getByTestId('handler-Second')).toBeInTheDocument();
    expect(invokeEventHandlers).toHaveBeenCalledTimes(2);
  });
});
