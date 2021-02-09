export function getEventHandler(event, stripes, module, data) {
  const m = module.getModule();
  const eventHander = m[module.handlerName];
  if (!eventHander) return null;
  return eventHander(event, stripes, data);
}

export function getEventHandlers(event, stripes, modules, data) {
  return modules.reduce((acc, m) => {
    const component = getEventHandler(event, stripes, m, data);
    if (component) {
      acc.push(stripes.connect(component));
    }
    return acc;
  }, []);
}
