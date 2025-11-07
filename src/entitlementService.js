/**
 * getModules
 * 1 Retrieve modules from stripes-config, wrapped in a dynamic import() in
 *   hopeful anticipation of that glorious day when we retrieve entitlement
 *   values in an API request instead of from a static list assembled at
 *   build-time.
 * 2 Load all the handler modules. Module-loading may be an async process but
 *   handler-modules must be available synchronously during AppRoutes' render
 *   cycle in order to call the static event-handler methods. Thus, we take
 *   advantage of this function's asynchonicity to load and cache them outside
 *   of render.
 */
export async function getModules() {
  const { modules } = await import('stripes-config');

  for (const handler of modules.handler) {
    // stripes-config compiled with --lazy defines getUnsuspendedModule()
    // so we can access dynamically loaded modules outside lazy().
    // this function is absent in a monolithic build so we use it here as the
    // condition to distinguish between a tree-shaken/lazy build and a
    // legacy/monolithic build.
    if (handler.getUnsuspendedModule) {
      handler.cachedModule = (await handler.getUnsuspendedModule()).default;
    } else {
      handler.cachedModule = handler.getModule();
    }
  }

  return modules;
}

