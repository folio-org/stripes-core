import { getModules } from './entitlementService';

describe('getModules', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('handles monolithic builds', async () => {
    const module = '@sally/rooney';
    const m = {
      getModule: () => ({ module }),
    };
    jest.mock('stripes-config', () => ({
      modules: {
        app: [m],
      },
    }), { virtual: true });

    const modules = await getModules({ isLazy: false });
    expect(modules.app).toHaveLength(1);
    expect(modules.app[0].getModule().module).toBe(module);
  });

  it('handles lazy builds', async () => {
    const module = '@conversations/with-friends';
    const m = {
      getDynamicModule: () => Promise.resolve({ default: { module } }),
    };
    jest.mock('stripes-config', () => ({
      modules: {
        app: [m],
      },
    }), { virtual: true });

    const modules = await getModules({ isLazy: true });
    expect(modules.app).toHaveLength(1);
    expect(typeof modules.app[0].getModule).toBe('function');
    expect(modules.app[0].getModule().module).toBe(module);
  });
});
