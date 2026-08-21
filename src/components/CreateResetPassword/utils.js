import queryString from 'query-string';

// eslint-disable-next-line import/prefer-default-export
export const getTenant = (stripes, location) => {
  return queryString.parse(location.search).tenant || stripes.okapi.tenant;
};
