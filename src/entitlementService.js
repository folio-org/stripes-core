/**
 * getModules
 * 1 Retrieve modules from stripes-config, wrapped in a dynamic import() in
 *   hopeful anticipation of that glorious day when we retrieve entitlement
 *   values in an API request instead of from a static list assembled at
 *   build-time.
 * 2 If the bundle was constructed with --lazy, load and cache all the modules,
 *   taking advantage of this function's asynchronicity to handle the dynamic
 *   import calls that cannot be called during render.
 *
 */
export async function getModules() {
  const { config, modules } = await import('stripes-config');

  // monolithic builds define sync getModule() methods; lazy builds define
  // async getDynamicModule() methods and therefore need to have their modules
  // loaded and cached ahead of time in order to provide synchronous access
  // during render when event handlers and plugins may be invoked.
  if (config.isLazy) {
    for (const [, list] of Object.entries(modules)) {
      const results = await Promise.all(list.map(i => i.getDynamicModule()));
      for (let i = 0; i < list.length; i++) {
        list[i].cachedModule = results[i];
        list[i].getModule = () => list[i].cachedModule.default;
      }
    }
  }

  return modules;
}
