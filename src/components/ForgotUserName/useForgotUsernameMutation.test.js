import { QueryClient, QueryClientProvider } from 'react-query';
import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';

import useForgotUsernameMutation from './useForgotUsernameMutation';
import { useStripes } from '../../StripesContext';
import useOkapiKy from '../../useOkapiKy';

const mockPost = jest.fn();

jest.mock('../../StripesContext', () => ({
  useStripes: jest.fn(),
}));

jest.mock('../../useOkapiKy', () => ({
  __esModule: true,
  default: jest.fn(() => ({ post: mockPost })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
    },
  });

  // eslint-disable-next-line react/prop-types
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useForgotUsernameMutation', () => {
  beforeEach(() => {
    mockPost.mockReturnValue({
      json: jest.fn().mockResolvedValue({}),
    });
    useStripes.mockReturnValue({ okapi: { authnUrl: 'authn' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sets `ignoreRtr: true` when creating the ky client', () => {
    renderHook(() => useForgotUsernameMutation(), { wrapper: createWrapper() });

    expect(useOkapiKy).toHaveBeenCalledWith({ rtrIgnore: true });
  });

  it.each([
    [{ authnUrl: 'authn' }, 'users-keycloak'],
    [{ authnUrl: '' }, 'bl-users'],
  ])('posts the forgotten username request to %s', async (okapi, pathPrefix) => {
    useStripes.mockReturnValue({ okapi });
    const { result } = renderHook(() => useForgotUsernameMutation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('some-user');
    });

    expect(mockPost).toHaveBeenCalledWith(
      `${pathPrefix}/forgotten/username`,
      { json: { id: 'some-user' } },
    );
  });
});
