import { act, renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import useEntitlementDidChange from './useEntitlementDidChange';
import useOkapiKy from '../useOkapiKy';

const interfaceProviders = [
];

jest.mock('../useOkapiKy');
jest.mock('../components', () => ({
  useNamespace: () => ([]),
}));
jest.mock('../StripesContext', () => ({
  useStripes: () => ({
    okapi: {
      tenant: 't',
    },
    discovery: {
      interfaceProviders,
    }
  }),
}));

const initialResponse = {
  applicationDescriptors: [
    { id: 'one' },
    { id: 'two' },
  ],
};

const changedResponse = {
  applicationDescriptors: [
    { id: 'one' },
    { id: 'three' },
  ],
};

describe('useEntitlementDidChange', () => {
  let queryClient;
  let wrapper;
  let kyMock;

  beforeEach(() => {
    queryClient = new QueryClient();
    kyMock = jest.fn();
    useOkapiKy.mockReturnValue(kyMock);
    // eslint-disable-next-line react/prop-types
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('returns false after the initial query', async () => {
    kyMock.mockImplementation(() => ({
      json: () => initialResponse,
    }));
    const { result } = renderHook(() => useEntitlementDidChange(), { wrapper });
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('returns false when entitlement data remains constant', async () => {
    kyMock.mockImplementation(() => ({
      json: () => initialResponse,
    }));
    const { result } = renderHook(() => useEntitlementDidChange(), { wrapper });
    await waitFor(() => expect(result.current).toBe(false));
    await act(async () => {
      await queryClient.refetchQueries(['EntitlementChangeWarning']);
    });
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('returns true when entitlement data changes', async () => {
    kyMock
      .mockImplementationOnce(() => ({
        json: () => initialResponse
      }))
      .mockImplementationOnce(() => ({
        json: () => changedResponse
      }));

    const { result } = renderHook(() => useEntitlementDidChange(), { wrapper });
    await waitFor(() => expect(result.current).toBe(false));
    await act(async () => {
      await queryClient.refetchQueries(['EntitlementChangeWarning']);
    });
    await waitFor(() => expect(result.current).toBe(true));
  });
});
