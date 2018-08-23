import React from 'react';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function getComponentFromHandler(event, stripes, module, data) {
  const m = module.getModule();
  const eventHander = m[module.handlerName];
  if (!eventHander) return null;
  return eventHander(event, stripes, data);
}

function getComponentsFromHandlers(event, stripes, modules, data) {
  return modules.reduce((acc, m) => {
    const component = getComponentFromHandler(event, stripes, m, data);
    if (component) {
      acc.push(stripes.connect(component));
    }
    return acc;
  }, []);
}

export default function withHandlers(WrappedComponent) {
  class WithHandlers extends React.Component {
    render() {
      return (
        <WrappedComponent
          getComponentsFromHandlers={getComponentsFromHandlers}
          getComponentFromHandler={getComponentFromHandler}
          {...this.props}
        />
      );
    }
  }
  WithHandlers.displayName = `WithHandlers(${getDisplayName(WrappedComponent)})`;

  return WithHandlers;
}
