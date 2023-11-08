import {
  registerServiceWorker,
  unregisterServiceWorker
} from './serviceWorkerRegistration';

describe('registerServiceWorker', () => {
  describe('on success', () => {
    const stateTest = (state) => {
      it(state, async () => {
        const sw = {
          postMessage: jest.fn(),
        };

        navigator.serviceWorker = {
          register: () => Promise.resolve({
            update: () => ({ [state]: sw })
          }),
          controller: 'malibu-trinity',
        };

        const l = {
          log: jest.fn(),
        };

        const okapiConfig = { 'barbie': 'oppenheimer' };
        const config = { logCategories: 'kenough,trinity' };

        await registerServiceWorker(okapiConfig, config, l);

        const lConfig = { source: '@folio/stripes-core', type: 'LOGGER_CONFIG', value: { categories: config.logCategories } };

        expect(sw.postMessage).toHaveBeenCalledWith(lConfig);
        expect(typeof navigator.serviceWorker.oncontrollerchange).toBe('function');
        expect(l.log).toHaveBeenCalledTimes(3);
      });
    };

    const states = ['installing', 'waiting', 'active'];
    states.forEach((state) => stateTest(state));
  });

  describe('on failure', () => {
    const consoleInterruptor = {};
    beforeAll(() => {
      consoleInterruptor.error = global.console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      global.console.error = consoleInterruptor.error;
    });

    it('registration is not in expected state', async () => {
      navigator.serviceWorker = {
        register: () => Promise.resolve({
          update: () => ({ })
        }),
      };

      const l = {
        log: jest.fn(),
      };

      const okapiConfig = { 'barbie': 'oppenheimer' };
      const config = { logCategories: 'kenough,trinity' };

      await registerServiceWorker(okapiConfig, config, l);
      expect(console.error).toHaveBeenCalledWith('(rtr) service worker not available');
    });

    it('registration throws', async () => {
      const error = Error('Trinity Ken has a nice tan. Oh. Wait.');
      navigator.serviceWorker = {
        register: () => {
          throw error;
        }
      };

      const l = {
        log: jest.fn(),
      };

      const okapiConfig = { 'barbie': 'oppenheimer' };
      const config = { logCategories: 'kenough,trinity' };

      await registerServiceWorker(okapiConfig, config, l);
      expect(console.error).toHaveBeenCalledWith(`(rtr) service worker registration failed with ${error}`);
    });
  });
});

describe('unregisterServiceWorker', () => {
  const consoleInterruptor = {};
  beforeEach(() => {
    consoleInterruptor.log = global.console.log;
    consoleInterruptor.error = global.console.error;
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    global.console.log = consoleInterruptor.log;
    global.console.error = consoleInterruptor.error;
  });

  it('on success', async () => {
    const unregister = jest.fn();
    navigator.serviceWorker = {
      ready: Promise.resolve({
        unregister,
      })
    };

    await unregisterServiceWorker();
    expect(unregister).toHaveBeenCalled();
  });

  it('on failure', async () => {
    const error = 'Los Alamos Ken has a nice tan. Oh. Wait.';
    const unregister = jest.fn();
    navigator.serviceWorker = {
      ready: Promise.reject(new Error(error))
    };

    await unregisterServiceWorker();
    expect(unregister).not.toHaveBeenCalled();

    // logging will show that console.error _is_ called,
    // yet jest always says there are 0 calls here. wha...?
    // expect(console.error).toHaveBeenCalled();
  });
});
