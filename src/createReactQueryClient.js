import { QueryClient, MutationCache } from 'react-query';

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
