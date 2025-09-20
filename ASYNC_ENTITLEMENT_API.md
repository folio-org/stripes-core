# Enhanced Entitlement Data API

This document demonstrates how to use the enhanced entitlement data API that now supports both synchronous and asynchronous scenarios.

## Overview

The entitlement API has been enhanced to intelligently handle both sync and async scenarios. **Existing methods now return Promises when entitlement data is not yet available**, providing seamless backward compatibility while enabling async functionality.

## Key Changes

- **`stripes.hasInterface(name, version)`** - Now returns a Promise if discovery is incomplete
- **`IfInterface` component** - Now handles async interface checking with loading states
- **EntitlementService** - Provides dedicated async entitlement access
- **ConfigService** - Provides async access to stripes-config data

## Types of Entitlement Data Made Async

### 1. Discovery Data (API-fetched)
- Applications and their modules
- Interface availability and versions  
- Module capabilities and providers

### 2. Configuration Data (stripes-config)
- Module definitions (`modules` from stripes-config)
- Tenant options (`config.tenantOptions`)
- Okapi configuration for entitlements

### 3. Combined Entitlement Context
- Unified access to both static and dynamic entitlement data

## Enhanced Methods

### Stripes.hasInterface() - Now Async-Aware

The `hasInterface` method now intelligently returns either sync or async results:

```javascript
const stripes = useStripes();

// If discovery is complete, returns immediately (sync)
const hasUsers = stripes.hasInterface('users', '15.0');

// If discovery is incomplete, returns a Promise (async)
const hasUsersPromise = stripes.hasInterface('users', '15.0');
if (hasUsersPromise && typeof hasUsersPromise.then === 'function') {
  const hasUsers = await hasUsersPromise;
}

// Or simply always handle as potentially async:
const hasUsers = await Promise.resolve(stripes.hasInterface('users', '15.0'));
```

### IfInterface Component - Enhanced with Loading States

```javascript
// IfInterface now handles async interface checking automatically
<IfInterface name="users" version="15.0">
  <UserManagementPanel />
</IfInterface>

// Shows loading state if needed, then renders content when interface is confirmed
```

### Direct EntitlementService Access

```javascript
import { getEntitlementService } from '@folio/stripes/core';

const service = getEntitlementService(store);
const entitlementData = await service.getEntitlements();
const applications = await service.getApplications();
const interfaces = await service.getInterfaces();
const hasUsers = await service.hasInterface('users', '15.0');
```

### Enhanced Stripes Object Methods

```javascript
// In a component with stripes prop
const MyComponent = ({ stripes }) => {
  const [hasUsersInterface, setHasUsersInterface] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkInterface = async () => {
      try {
        // hasInterface now handles both sync and async scenarios
        const result = await Promise.resolve(stripes.hasInterface('users', '15.0'));
        setHasUsersInterface(!!result);
      } catch (error) {
        console.error('Failed to check interface:', error);
      } finally {
        setLoading(false);
      }
    };

    checkInterface();
  }, [stripes]);

  if (loading) return <Loading />;

  return (
    <div>
      {hasUsersInterface ? (
        <UserManagement />
      ) : (
        <div>User management not available</div>
      )}
    </div>
  );
};

// Access discovery data with async support
const getDiscoveryData = async (stripes) => {
  // getDiscovery() returns sync data if available, Promise if not
  const discovery = await Promise.resolve(stripes.getDiscovery());
  return discovery.applications;
};
```

### From Stripes object

```javascript
// In a component with stripes prop
const MyComponent = ({ stripes }) => {
  const [interfaces, setInterfaces] = useState({});

  useEffect(() => {
    const loadInterfaces = async () => {
      try {
        const entitlementData = await stripes.getEntitlementDataAsync();
        setInterfaces(entitlementData.interfaces);
      } catch (error) {
        console.error('Failed to load entitlement data:', error);
      }
    };

    loadInterfaces();
  }, [stripes]);

  return (
    <div>
      {Object.keys(interfaces).map(interfaceName => (
        <div key={interfaceName}>
          {interfaceName}: {interfaces[interfaceName]}
        </div>
      ))}
    </div>
  );
};

// Check interface with async method
const checkInterface = async (stripes) => {
  try {
    const hasUsers = await stripes.hasInterfaceAsync('users', '15.0');
    if (hasUsers) {
      console.log('Users interface available:', hasUsers);
    }
  } catch (error) {
    console.error('Interface check failed:', error);
  }
};
```

### Async Hook Alternative

```javascript
import { useModuleInfoAsync } from '@folio/stripes/core';

const MyComponent = ({ currentPath }) => {
  const { moduleInfo, loading, error } = useModuleInfoAsync(currentPath);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!moduleInfo) return <div>No module info available</div>;

  return (
    <div>
      Module: {moduleInfo.name} ({moduleInfo.interface} v{moduleInfo.version})
    </div>
  );
};
```

### Async Configuration Services

```javascript
import { getConfigService } from '@folio/stripes/core';

// Get tenant options asynchronously
const configService = getConfigService();
const tenantOptions = await configService.getTenantOptions();

// Check if specific tenant is available
const hasTenant = await configService.hasTenantOption('diku');

// Get all configuration data
const allConfig = await configService.getAllConfig();
```

### Async Modules Context

```javascript
import { useModulesAsync, AsyncModulesProvider } from '@folio/stripes/core';

// Provider component (usually at app root)
const App = () => (
  <AsyncModulesProvider entitlementService={entitlementService}>
    <MyApp />
  </AsyncModulesProvider>
);

// Consumer component
const ModulesList = () => {
  const { modules, loading, error } = useModulesAsync();

  if (loading) return <Loading />;
  if (error) return <div>Error loading modules: {error}</div>;

  return (
    <ul>
      {Object.values(modules).map(module => (
        <li key={module.name}>{module.displayName || module.name}</li>
      ))}
    </ul>
  );
};
```

## Backward Compatibility

The existing synchronous API continues to work unchanged:

```javascript
// Existing synchronous access (still works)
const stripes = useStripes();
const applications = stripes.discovery?.applications || {};
const hasUsers = stripes.hasInterface('users', '15.0');
```

## When to Use Async vs Sync

### Use Async API when:
- You need to ensure entitlement data is available before proceeding
- Working in initialization code where discovery might not be complete
- Building new features that need to be future-ready for dynamic loading
- You want to handle loading states properly

### Use Sync API when:
- You're in existing code that already handles undefined states
- Performance is critical and you can handle undefined gracefully
- You're certain discovery has already completed

## Error Handling

The async API provides proper error handling:

```javascript
try {
  const interfaces = await getInterfacesAsync(store);
  // Use interfaces...
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle discovery timeout
    console.error('Entitlement data loading timed out');
  } else if (error.message.includes('Discovery failed')) {
    // Handle discovery failure
    console.error('Failed to discover services:', error.message);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Migration Guide

To migrate existing code to use the async API:

### Before (Sync):
```javascript
const MyComponent = ({ stripes }) => {
  const applications = stripes.discovery?.applications || {};
  
  if (!stripes.discovery?.isFinished) {
    return <Loading />;
  }
  
  return <ApplicationList applications={applications} />;
};
```

### After (Async):
```javascript
const MyComponent = ({ stripes }) => {
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const apps = await stripes.getEntitlementDataAsync();
        setApplications(apps.applications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [stripes]);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  
  return <ApplicationList applications={applications} />;
};
```

### Hook Migration

#### Before (useModuleInfo - sync):
```javascript
const MyComponent = ({ currentPath }) => {
  const moduleInfo = useModuleInfo(currentPath);
  const stripes = useStripes();

  // Must manually check if discovery is ready
  if (!stripes.discovery?.isFinished) {
    return <Loading />;
  }

  if (!moduleInfo) return <div>No module info</div>;
  
  return <div>Module: {moduleInfo.name}</div>;
};
```

#### After (useModuleInfoAsync - async):
```javascript
const MyComponent = ({ currentPath }) => {
  const { moduleInfo, loading, error } = useModuleInfoAsync(currentPath);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!moduleInfo) return <div>No module info available</div>;

  return <div>Module: {moduleInfo.name}</div>;
};
```

### Modules Migration

#### Before (useModules - sync):
```javascript
import { useModules } from '@folio/stripes/core';

const ModulesList = () => {
  const modules = useModules();
  
  // Modules are immediately available but static
  return (
    <ul>
      {Object.values(modules).map(module => (
        <li key={module.name}>{module.displayName}</li>
      ))}
    </ul>
  );
};
```

#### After (useModulesAsync - async):
```javascript
import { useModulesAsync } from '@folio/stripes/core';

const ModulesList = () => {
  const { modules, loading, error } = useModulesAsync();

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {Object.values(modules).map(module => (
        <li key={module.name}>{module.displayName}</li>
      ))}
    </ul>
  );
};
```

### Configuration Migration

#### Before (direct stripes-config import):
```javascript
import { config } from 'stripes-config';

const MyComponent = () => {
  const tenantOptions = config.tenantOptions || {};
  // Synchronous access to static config
  
  return <TenantSelector options={tenantOptions} />;
};
```

#### After (async config service):
```javascript
import { getConfigService } from '@folio/stripes/core';

const MyComponent = () => {
  const [tenantOptions, setTenantOptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configService = getConfigService();
        const options = await configService.getTenantOptions();
        setTenantOptions(options);
      } catch (error) {
        console.error('Failed to load tenant options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (loading) return <Loading />;
  return <TenantSelector options={tenantOptions} />;
};
```

## Service Management

The EntitlementService can be managed directly if needed:

```javascript
import { getEntitlementService, resetEntitlementService } from '@folio/stripes/core';

// Get the service instance
const service = getEntitlementService(store);

// Use service methods directly
const applications = await service.getApplications();
const hasInterface = await service.hasInterface('users');

// Reset for testing
resetEntitlementService();
```