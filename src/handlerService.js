/**
 * handleEvent
 * Call the module's event handler and return the result. A handler that wants
 * to intercede will return a component to be rendered. A handler that ignores
 * the event or merely invokes side-effects will return null.
 *
 * @param {string} event from ./events.js
 * @param {object} stripes
 * @param {object} handler a component with an event-handling function
 * @param {object } data shaped like { displayName, name, module} values from
 *   the module the event was invoked on
 * @returns Component to intercede, null otherwise
 */
export function handleEvent(event, stripes, handler, data) {
  const m = handler.cachedModule;
  const eventHander = m[handler.handlerName];

  // it's possible this module declares handlerName in its package.json
  // but doesn't actually define a corresponding method. whoops!
  if (!eventHander) {
    // eslint-disable-next-line no-console
    console.warn(`${handler.module} does not provide the event handler ${handler.handlerName} it declares in its package.json`);
    return null;
  }

  stripes.logger.log('event', `handling ${event} in ${handler.module}...`);

  // invoke the event handler
  return eventHander(event, stripes, data);
}

/**
 * invokeEventHandlers
 * invoke event handlers, returning an array of components to render or an
 * empty array if all handlers ignore the event or have only side-effects.
 *
 * @param {string} event from ./events.js
 * @param {object} stripes
 * @param {Array} handlerModules modules declaring actsAs['handler']
 * @param {object } data shaped like { displayName, name, module} values from
 *   the module the event was invoked on
 * @returns Array of interceding components to render, or an empty Array
 */
export function invokeEventHandlers(event, stripes, handlerModules, data) {
  return handlerModules.reduce((acc, handler) => {
    const component = handleEvent(event, stripes, handler, data);
    if (component) {
      const connectedComponent = stripes.connect(component);
      connectedComponent.module = handler;
      acc.push(connectedComponent);
    }
    return acc;
  }, []);
}
