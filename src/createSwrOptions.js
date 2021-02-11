/**
 * SWR global config
 *  https://swr.vercel.app/docs/options
 */

const cacheTimeMinutes = 5;

const createSwrOptions = () => ({

  // auto revalidate when window gets focused; https://swr.vercel.app/docs/revalidation
  revalidateOnFocus: false,

  // retry when fetcher has an error
  shouldRetryOnError: false,

  // refresh interval polling interval (disabled by default)
  refreshInterval: 1000 * 60 * cacheTimeMinutes,
});

export default createSwrOptions;
