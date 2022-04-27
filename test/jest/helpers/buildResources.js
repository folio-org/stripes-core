export const buildResources = ({
  resourceName,
  updaterName,
  records = [],
  updaterRecords = [],
  hasLoaded = true,
  isPending = false,
  otherResources = {},
}) => {
  const resources = {
    query: {},
    [resourceName]: {
      records,
      hasLoaded,
      isPending,
      other: { totalRecords: records.length },
    },
    [updaterName]: {
      updaterRecords,
      hasLoaded,
      isPending,
      other: { totalRecords: records.length },
    },
    ...otherResources,
  };

  Object.defineProperty(resources.query, 'sort', { get: () => new URLSearchParams(window.location.search).get('sort') || '' });
  Object.defineProperty(resources.query, 'query', { get: () => new URLSearchParams(window.location.search).get('query') || '' });
  return resources;
};

export default buildResources;
