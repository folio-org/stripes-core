import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useQueries } from 'react-query';

import { chunk } from 'lodash';
import useOkapiKy from '../useOkapiKy';

/* When fetching from a potentially large list of items,
 * make sure to chunk the request to avoid hitting limits.

 * This is a contentious inclusion in stripes-core, as it encourages
 * frontend joins rather than "proper" API design, and developers should
 * be aware that this represents something of an antipattern. However, on
 * occasion frontend joins are the most expedient and efficient ways of completing
 * cross-module functionality, and so this hook aims to standardise the bulk
 * fetching of resources from a CQL module.
 *
 * See slack thread https://folio-project.slack.com/archives/C210UCHQ9/p1688141053428329
 * for more context.
 */

// Only defining defaults to ward of "magic number" sonarlint rule -.-
const CONCURRENT_REQUESTS_DEFAULT = 5;
const STEP_SIZE_DEFAULT = 60;

// CONCURRENT_REQUESTS and STEP_SIZE can be tweaked here, but implementor beware
// They are formatted as if constants to discourage this
const useChunkedCQLFetch = ({
  CONCURRENT_REQUESTS = CONCURRENT_REQUESTS_DEFAULT, // Number of requests to make concurrently
  endpoint, // endpoint to hit to fetch items
  generateQueryKey, // Passed function to allow customised query keys
  ids: passedIds, // List of IDs to fetch
  idName = 'id', // Named ID field to use in the CQL query (i.e. id or userId)
  limit = 1000, // Item limit to fetch on each request
  queryOptions: passedQueryOptions = {}, // Options to pass to each query
  reduceFunction, // Function to reduce fetched objects at the end into single array
  STEP_SIZE = STEP_SIZE_DEFAULT, // Number of IDs fetch per request
  tenantId, // Tenant ID to which requests should be directed
}) => {
  const ky = useOkapiKy({ tenant: tenantId });

  // Destructure passed query options to grab enabled
  const { enabled: queryEnabled = true, ...queryOptions } = passedQueryOptions;

  // Deduplicate incoming ID list
  const ids = useMemo(() => [...new Set(passedIds)], [passedIds]);

  const chunkedItems = chunk(ids, STEP_SIZE);
  // chunkedItems will be an array of arrays of size CONCURRENT_REQUESTS * STEP_SIZE
  // We need to parallelise CONCURRENT_REQUESTS at a time,
  // and ensure we only fire the next lot once the previous lot are through

  const [isLoading, setIsLoading] = useState(ids?.length > 0);


  // Set up query array, and only enable the first CONCURRENT_REQUESTS requests
  const getQueryArray = useCallback(() => {
    const queryArray = [];
    chunkedItems.forEach((chunkedItem, chunkedItemIndex) => {
      const query = `${idName}==(${chunkedItem.join(' or ')})`;
      const queryKey = generateQueryKey ?
        generateQueryKey({
          CONCURRENT_REQUESTS,
          chunkedItem,
          chunkedItemIndex,
          endpoint,
          ids,
          queryOptions,
          STEP_SIZE,
          tenantId,
        }) :
        ['stripes-core', endpoint, chunkedItem, tenantId];
      queryArray.push({
        queryKey,
        queryFn: () => ky.get(`${endpoint}?limit=${limit}&query=${query}`).json(),
        // Only enable once the previous slice has all been fetched
        enabled: queryEnabled && chunkedItemIndex < CONCURRENT_REQUESTS,
        ...queryOptions
      });
    });

    return queryArray;
  }, [
    chunkedItems,
    CONCURRENT_REQUESTS,
    endpoint,
    generateQueryKey,
    idName,
    ids,
    limit,
    ky,
    queryEnabled,
    queryOptions,
    STEP_SIZE,
    tenantId,
  ]);

  const queryArray = getQueryArray();

  const itemQueries = useQueries(queryArray);

  // Once chunk has finished fetching, fetch next chunk
  useEffect(() => {
    const chunkedQuery = chunk(itemQueries, CONCURRENT_REQUESTS);
    chunkedQuery.forEach((q, i) => {
      // Check that all previous chunk are fetched,
      // and that all of our current chunk are not fetched and not loading
      if (
        i !== 0 &&
        chunkedQuery[i - 1]?.every(pq => pq.isFetched === true) &&
        q.every(req => req.isFetched === false) &&
        q.every(req => req.isLoading === false)
      ) {
        // Trigger fetch for each request in the chunk
        q.forEach(req => {
          req.refetch();
        });
      }
    });
  }, [CONCURRENT_REQUESTS, itemQueries]);

  // Keep easy track of whether this hook is all loaded or not
  // (This slightly flattens the "isLoading/isFetched" distinction, but it's an ease of use prop)
  useEffect(() => {
    const newLoading = ids?.length > 0 && (!itemQueries?.length || itemQueries?.some(uq => !uq.isFetched));

    if (isLoading !== newLoading) {
      setIsLoading(newLoading);
    }
  }, [isLoading, itemQueries, ids?.length]);


  return {
    itemQueries,
    isLoading,
    // Offer all fetched orderLines in flattened array once ready
    items: isLoading ? [] : reduceFunction(itemQueries),
    queryKeys: queryArray.map(q => q.queryKey)
  };
};

export default useChunkedCQLFetch;
