import { useMutation, QueryClientProvider } from 'react-query';
import { renderHook, act } from '@testing-library/react-hooks';

import createReactQueryClient from './createReactQueryClient';

const mockMutation = jest.fn(() => {
  throw new Error('Mutation failed');
});

const useMockedMutation = (options) => useMutation(mockMutation, options);

const wrapper = ({ children }) => (
  <QueryClientProvider client={createReactQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('createReactQueryClient', () => {
  beforeEach(() => {
    window.alert = jest.fn();
  });

  afterEach(() => {
    window.alert.mockClear();
  });

  it('skips the onError function when the onError option is passed to useMutation', async () => {
    const { result } = renderHook(() => useMockedMutation({ onError: () => jest.fn() }), { wrapper });

    await act(async () => {
      await result.current.mutate();
    });

    expect(window.alert).not.toHaveBeenCalled();
  });

  it('calls global onError function when the onError option is not passed to useMutation', async () => {
    const { result } = renderHook(() => useMockedMutation(), { wrapper });

    await act(async () => {
      await result.current.mutate();
    });

    expect(window.alert).toHaveBeenCalled();
  });
});
