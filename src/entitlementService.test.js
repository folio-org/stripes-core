import { createEntitlementService, getEntitlementService, resetEntitlementService } from './entitlementService';

describe('EntitlementService', () => {
  let mockStore;
  let entitlementService;

  beforeEach(() => {
    // Reset the singleton before each test
    resetEntitlementService();
    
    // Mock store with basic structure
    mockStore = {
      getState: jest.fn(),
      subscribe: jest.fn(),
      dispatch: jest.fn()
    };
  });

  afterEach(() => {
    resetEntitlementService();
  });

  describe('createEntitlementService', () => {
    it('should create a new EntitlementService instance', () => {
      entitlementService = createEntitlementService(mockStore);
      expect(entitlementService).toBeDefined();
      expect(entitlementService.store).toBe(mockStore);
    });
  });

  describe('getEntitlementService', () => {
    it('should create and return default service instance', () => {
      const service1 = getEntitlementService(mockStore);
      const service2 = getEntitlementService();
      
      expect(service1).toBe(service2); // Should return same instance
    });

    it('should throw error if called without store and no default exists', () => {
      expect(() => getEntitlementService()).toThrow('EntitlementService not initialized');
    });
  });

  describe('when discovery is already finished', () => {
    beforeEach(() => {
      mockStore.getState.mockReturnValue({
        discovery: {
          isFinished: true,
          applications: { app1: { name: 'app1' } },
          interfaces: { interface1: '1.0.0' },
          modules: { module1: 'module1' }
        }
      });
      entitlementService = createEntitlementService(mockStore);
    });

    it('should resolve getEntitlements immediately', async () => {
      const result = await entitlementService.getEntitlements();
      
      expect(result).toEqual({
        applications: { app1: { name: 'app1' } },
        interfaces: { interface1: '1.0.0' },
        modules: { module1: 'module1' },
        isFinished: true,
        failure: null,
        okapi: null,
        interfaceProviders: [],
        permissionDisplayNames: {}
      });
    });

    it('should resolve getApplications', async () => {
      const result = await entitlementService.getApplications();
      expect(result).toEqual({ app1: { name: 'app1' } });
    });

    it('should resolve getInterfaces', async () => {
      const result = await entitlementService.getInterfaces();
      expect(result).toEqual({ interface1: '1.0.0' });
    });

    it('should resolve hasInterface with true for existing interface', async () => {
      const result = await entitlementService.hasInterface('interface1');
      expect(result).toBe(true);
    });

    it('should resolve hasInterface with false for missing interface', async () => {
      const result = await entitlementService.hasInterface('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('when discovery is in progress', () => {
    let unsubscribeCallback;

    beforeEach(() => {
      // Mock store that hasn't finished discovery
      mockStore.getState.mockReturnValue({
        discovery: {
          isFinished: false
        }
      });

      // Mock subscribe to capture the callback
      mockStore.subscribe.mockImplementation((callback) => {
        unsubscribeCallback = callback;
        return jest.fn(); // Return unsubscribe function
      });

      entitlementService = createEntitlementService(mockStore);
    });

    it('should wait for discovery to complete', async () => {
      const promise = entitlementService.getEntitlements();

      // Simulate discovery completion
      setTimeout(() => {
        mockStore.getState.mockReturnValue({
          discovery: {
            isFinished: true,
            applications: { app2: { name: 'app2' } },
            interfaces: { interface2: '2.0.0' },
            modules: { module2: 'module2' }
          }
        });
        unsubscribeCallback(); // Trigger the subscription callback
      }, 10);

      const result = await promise;
      expect(result.applications).toEqual({ app2: { name: 'app2' } });
      expect(result.isFinished).toBe(true);
    });

    it('should reject on discovery failure', async () => {
      const promise = entitlementService.getEntitlements();

      // Simulate discovery failure
      setTimeout(() => {
        mockStore.getState.mockReturnValue({
          discovery: {
            isFinished: false,
            failure: { message: 'Discovery failed', code: 500 }
          }
        });
        unsubscribeCallback();
      }, 10);

      await expect(promise).rejects.toThrow('Discovery failed: Discovery failed');
    });
  });

  describe('async export functions', () => {
    beforeEach(() => {
      mockStore.getState.mockReturnValue({
        discovery: {
          isFinished: true,
          applications: { app1: { name: 'app1' } },
          interfaces: { interface1: '1.0.0' },
          modules: { module1: 'module1' }
        }
      });
    });

    it('EntitlementService getEntitlements should work via getEntitlementService', async () => {
      const service = getEntitlementService(mockStore);
      const result = await service.getEntitlements();
      expect(result.applications).toEqual({ app1: { name: 'app1' } });
    });

    it('EntitlementService getApplications should work via getEntitlementService', async () => {
      const service = getEntitlementService(mockStore);
      const result = await service.getApplications();
      expect(result).toEqual({ app1: { name: 'app1' } });
    });

    it('EntitlementService getInterfaces should work via getEntitlementService', async () => {
      const service = getEntitlementService(mockStore);
      const result = await service.getInterfaces();
      expect(result).toEqual({ interface1: '1.0.0' });
    });

    it('EntitlementService hasInterface should work via getEntitlementService', async () => {
      const service = getEntitlementService(mockStore);
      const result = await service.hasInterface('interface1');
      expect(result).toBe(true);
    });
  });
});