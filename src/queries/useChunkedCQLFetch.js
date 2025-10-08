import useChunkedIdTransformFetch from './useChunkedIdTransformFetch';

// When fetching from a potentially large list of items, split the list over
// multiple requests and then reassemble the results in order to avoid
// a HTTP 414/URI Too Long error.

// This hook handles CQL endpoints only; see useChunkedIdTransformFetch
// for a generic implementation.
const useChunkedCQLFetch = ({
  idName = 'id', // Named ID field to use in the CQL query (i.e. id or userId)
  limit = 1000, // Item limit to fetch on each request
  ...props // Other props for useChunkedIdTransformFetch
}) => {
  return useChunkedIdTransformFetch({
    // This is the place to put logic which performs transforms in CQL queries
    chunkedQueryIdTransform: (chunkedIds) => `?limit=${limit}&query=${idName}==(${chunkedIds.join(' or ')})`,
    ...props,
  });
};

export default useChunkedCQLFetch;
