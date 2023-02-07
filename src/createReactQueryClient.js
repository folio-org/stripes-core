import { QueryClient, MutationCache } from 'react-query';

const handleError = async (error) => {
  try {
    const { response: { headers, status, url } } = error;
    const contentType = headers?.get('content-type');
    const message = (contentType === 'text/plain') ?
      await error.response.text() :
      JSON.stringify(await error.response.json());
    // eslint-disable-next-line no-alert
    alert(`HTTP ERROR with status: ${status}\n\nOn resource:\n${url}\n\nSaying:\n${message}`);
  } catch (e) {
    // eslint-disable-next-line no-alert
    alert(error);
  }
};

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
      handleError(error);
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
