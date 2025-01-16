import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import useModuleInfo from './useModuleInfo';
import useOkapiKy from '../useOkapiKy';

const response = [
  {
    'id': 'mod-users-19.4.5-SNAPSHOT.330',
    'name': 'users',
    'provides': [
      {
        'id': 'users',
        'version': '16.3',
        'handlers': [
          {
            'methods': [
              'GET'
            ],
            'pathPattern': '/users',
            'permissionsRequired': [
              'users.collection.get'
            ],
            'permissionsDesired': [
              'users.basic-read.execute',
              'users.restricted-read.execute'
            ]
          },
          {
            'methods': [
              'GET'
            ],
            'pathPattern': '/users/{id}',
            'permissionsRequired': [
              'users.item.get'
            ],
            'permissionsDesired': [
              'users.basic-read.execute',
              'users.restricted-read.execute'
            ]
          },
          {
            'methods': [
              'POST'
            ],
            'pathPattern': '/users',
            'permissionsRequired': [
              'users.item.post'
            ]
          },
          {
            'methods': [
              'GET'
            ],
            'pathPattern': '/users/profile-picture/{id}',
            'permissionsRequired': [
              'users.profile-picture.item.get'
            ]
          },
        ]
      }
    ]
  },
  {
    'id': 'mod-circulation-24.4.0',
    'name': 'Circulation Module',
    'provides': [
      {
        'id': 'requests-reports',
        'version': '0.8',
        'handlers': [
          {
            'methods': [
              'GET'
            ],
            'pathPattern': '/circulation/requests-reports/hold-shelf-clearance/{id}',
            'permissionsRequired': [
              'circulation.requests.hold-shelf-clearance-report.get'
            ],
            'modulePermissions': [
              'modperms.circulation.requests.hold-shelf-clearance-report.get'
            ]
          }
        ]
      },
      {
        'id': 'inventory-reports',
        'version': '0.4',
        'handlers': [
          {
            'methods': [
              'GET'
            ],
            'pathPattern': '/inventory-reports/items-in-transit',
            'permissionsRequired': [
              'circulation.inventory.items-in-transit-report.get'
            ],
            'modulePermissions': [
              'modperms.inventory.items-in-transit-report.get'
            ]
          }
        ]
      },
      {
        'id': 'pick-slips',
        'version': '0.4',
        'handlers': [
          {
            'methods': [
              'GET'
            ],
            'pathPattern': '/circulation/pick-slips/{servicePointId}',
            'permissionsRequired': [
              'circulation.pick-slips.get'
            ],
            'modulePermissions': [
              'modperms.circulation.pick-slips.get'
            ]
          }
        ]
      }
    ],
  }
];

jest.mock('../useOkapiKy', () => ({
  __esModule: true, // this property makes it work
  default: () => ({
    get: () => ({
      json: () => response,
    })
  })
}));
jest.mock('../components', () => ({
  useNamespace: () => ([]),
}));
jest.mock('../StripesContext', () => ({
  useStripes: () => ({
    okapi: {
      tenant: 't',
    }
  }),
}));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);


describe('useModuleInfo', () => {
  beforeEach(() => {
    useOkapiKy.get = () => ({
      json: () => console.log({ response })
    });
  });

  describe('returns the module-name that provides the interface containing a given path', () => {
    it('handles paths with leading /', async () => {
      const { result } = renderHook(() => useModuleInfo('/users'), { wrapper });
      await waitFor(() => result.current.module.name);
      expect(result.current.module.name).toEqual('mod-users');
    });

    it('handles paths without leading /', async () => {
      const { result } = renderHook(() => useModuleInfo('inventory-reports/items-in-transit'), { wrapper });
      await waitFor(() => result.current.module.name);
      expect(result.current.module.name).toEqual('mod-circulation');
    });

    it('ignores query string', async () => {
      const { result } = renderHook(() => useModuleInfo('/users?query=foo==bar'), { wrapper });
      await waitFor(() => result.current.module.name);
      expect(result.current.module.name).toEqual('mod-users');
    });
  });

  it('returns undefined given an unmatched path', async () => {
    const { result } = renderHook(() => useModuleInfo('/monkey-bagel'), { wrapper });
    await waitFor(() => result.current.module);
    expect(result.current.module).toBeUndefined();
  });
});
