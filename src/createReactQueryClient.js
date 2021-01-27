import { QueryClient } from 'react-query';

const cacheTimeMinutes = 5;

const createReactQueryClient = () => new QueryClient({
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
