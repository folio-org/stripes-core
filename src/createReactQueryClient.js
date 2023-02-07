import { QueryClient, MutationCache } from 'react-query';

/**
  `MutationCache` is being used here to setup a global `onError` handler
  in cases when the error happens during a mutation and the local `onError` handler
  has not been provided via `useMutation`.

  In order to avoid falling back to a default global onError please provide a local
  onError handler e.g.:

  useMutation(mutationFn, {
    onError: (error) => {
      handle the error here
    }
  });
*/
const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    // if local onError is not present
    if (!mutation?.options?.onError) {
      // eslint-disable-next-line no-alert
      alert(error);
    }
  }
});

const cacheTimeMinutes = 5;

const createReactQueryClient = () => new QueryClient({
  mutationCache,
  // https://react-query.tanstack.com/guides/important-defaults
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * cacheTimeMinutes,
    },
  },
});

export default createReactQueryClient;
