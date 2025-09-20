import entitlementService from './entitlementService';
import { discoveryReducer } from './discoverServices';

describe('EntitlementService', () => {
  let mockStore;

  beforeEach(() => {
    // Reset service before each test
    entitlementService.reset();
    
    // Mock store with dispatch and getState
    mockStore = {
      dispatch: jest.fn(),
      getState: jest.fn(() => ({
        discovery: {
          applications: { 'test-app': { name: 'test-app' } },
          interfaces: { 'test-interface': '1.0' },
          modules: { 'test-module': 'test-module-name' },
          interfaceProviders: [],
          permissionDisplayNames: {},
          isFinished: true
        }
      }))
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with a store', () => {
      expect(() => entitlementService.initialize(mockStore)).not.toThrow();
    });

    it('should throw error when getting entitlements without initialization', async () => {
      entitlementService.reset();
      await expect(entitlementService.getEntitlements()).rejects.toThrow(
        'EntitlementService must be initialized with a store before use'
      );
    });
  });

  describe('async entitlement data access', () => {
    beforeEach(() => {
      entitlementService.initialize(mockStore);
    });

    it('should return applications data', async () => {
      const applications = await entitlementService.getApplications();
      expect(applications).toEqual({ 'test-app': { name: 'test-app' } });
    });

    it('should return interfaces data', async () => {
      const interfaces = await entitlementService.getInterfaces();
      expect(interfaces).toEqual({ 'test-interface': '1.0' });
    });

    it('should return modules data', async () => {
      const modules = await entitlementService.getModules();
      expect(modules).toEqual({ 'test-module': 'test-module-name' });
    });

    it('should check if interface exists', async () => {
      const hasInterface = await entitlementService.hasInterface('test-interface');
      expect(hasInterface).toBe('1.0');
    });

    it('should return undefined for missing interface', async () => {
      const hasInterface = await entitlementService.hasInterface('missing-interface');
      expect(hasInterface).toBeUndefined();
    });

    it('should check version compatibility', async () => {
      const hasInterface = await entitlementService.hasInterface('test-interface', '1.0');
      expect(hasInterface).toBe('1.0');
    });

    it('should return false for incompatible version', async () => {
      const hasInterface = await entitlementService.hasInterface('test-interface', '2.0');
      expect(hasInterface).toBe(false);
    });

    it('should return true when loading is finished', async () => {
      const finished = await entitlementService.isFinished();
      expect(finished).toBe(true);
    });
  });

  describe('caching behavior', () => {
    beforeEach(() => {
      entitlementService.initialize(mockStore);
    });

    it('should cache entitlement data', async () => {
      await entitlementService.getEntitlements();
      await entitlementService.getEntitlements();
      
      // Should only call getState once due to caching
      expect(mockStore.getState).toHaveBeenCalledTimes(1);
    });

    it('should clear cache when requested', async () => {
      await entitlementService.getEntitlements();
      entitlementService.clearCache();
      await entitlementService.getEntitlements();
      
      // Should call getState twice after cache clear
      expect(mockStore.getState).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      // Mock store that throws error
      mockStore.getState = jest.fn(() => {
        throw new Error('Store error');
      });
      entitlementService.initialize(mockStore);
    });

    it('should handle store errors gracefully', async () => {
      await expect(entitlementService.getEntitlements()).rejects.toThrow('Store error');
    });
  });

  describe('discovery data not ready', () => {
    beforeEach(() => {
      mockStore.getState = jest.fn(() => ({
        discovery: {
          // No isFinished property - data not ready
        }
      }));
      entitlementService.initialize(mockStore);
    });

    it('should wait for discovery data', async () => {
      // Start the promise
      const entitlementPromise = entitlementService.getEntitlements();
      
      // Simulate discovery finishing after a delay
      setTimeout(() => {
        mockStore.getState.mockReturnValue({
          discovery: {
            applications: {},
            interfaces: {},
            modules: {},
            interfaceProviders: [],
            permissionDisplayNames: {},
            isFinished: true
          }
        });
      }, 50);

      const data = await entitlementPromise;
      expect(data.isFinished).toBe(true);
    }, 1000);
  });
});

describe('discoveryReducer integration', () => {
  it('should handle DISCOVERY_FINISHED action', () => {
    const state = { applications: {}, interfaces: {} };
    const action = { type: 'DISCOVERY_FINISHED' };
    
    const newState = discoveryReducer(state, action);
    expect(newState.isFinished).toBe(true);
  });

  it('should handle DISCOVERY_INTERFACES action', () => {
    const state = { interfaces: {} };
    const action = {
      type: 'DISCOVERY_INTERFACES',
      data: {
        provides: [
          { id: 'test-interface', version: '1.0' }
        ]
      }
    };
    
    const newState = discoveryReducer(state, action);
    expect(newState.interfaces['test-interface']).toBe('1.0');
  });
});