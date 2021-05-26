export function getEventHandler(event, stripes, module, data) {
  const m = module.getModule();
  const eventHander = m[module.handlerName];
  if (!eventHander) return null;
  return eventHander(event, stripes, data);
}

export function getEventHandlers(event, stripes, modules, data) {
  return modules.reduce((acc, module) => {
    const component = getEventHandler(event, stripes, module, data);
    if (component) {
      const connectedComponent = stripes.connect(component);
      connectedComponent.module = module;
      acc.push(connectedComponent);
    }
    return acc;
  }, []);
}
