import useChunkedIdTransformFetch from './useChunkedIdTransformFetch';

// useChunkedCQLFetch remains to avoid backwards compatibility issues,
// but makes use of generalised useChunkedIdTransformFetch
// This is the place to make changes and additions which can be consumed by CQL type API endpoints
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
