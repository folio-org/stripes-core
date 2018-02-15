import { snakeCase, isEqual, omitBy, isNil, isEmpty } from 'lodash';
import queryString from 'query-string';
import { replaceQueryResource } from './locationActions';

function getLocationQuery(location) {
  return location.query ? location.query : queryString.parse(location.search);
}

export function getQueryResourceKey({ dataKey, module, queryResource }) {
  return `${dataKey || ''}${snakeCase(module)}_${queryResource}`;
}

export function getQueryResourceState(module, store) {
  const key = getQueryResourceKey(module);
  return store.getState()[key];
}

// updates query resource based on the current location query
export function updateQueryResource(location, module, store) {
  const stateQuery = getQueryResourceState(module, store);
  const locationQuery = getLocationQuery(location);

  if (isEqual(stateQuery, locationQuery)) return;

  store.dispatch(replaceQueryResource(module, locationQuery));
}

// updates location query based on the change in the query resource
export function updateLocation(module, store, history, location) {
  const stateQuery = getQueryResourceState(module, store);
  const locationQuery = getLocationQuery(location);

  if (isEqual(stateQuery, locationQuery)) return;

  const allParams = Object.assign({}, locationQuery, stateQuery);
  let url = allParams._path || location.pathname;
  delete allParams._path;

  const params = omitBy(allParams, isNil);

  if (!isEmpty(params)) {
    url += `?${queryString.stringify(params)}`;
  }

  history.push(url);
}
