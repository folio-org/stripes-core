import { snakeCase, isEqual, omitBy, isEmpty, unset } from 'lodash';
import queryString from 'query-string';
import { replaceQueryResource } from './locationActions';

function getLocationQuery(location) {
  return location.query ? location.query : queryString.parse(location.search);
}

export function getQueryResourceKey({ dataKey, module, queryResource }) {
  const prefix = dataKey ? `${dataKey}#` : '';
  return `${prefix}${snakeCase(module)}_${queryResource}`;
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
export function updateLocation(module, curQuery, store, history, location) {
  const stateQuery = getQueryResourceState(module, store);
  const locationQuery = getLocationQuery(location);
  const cleanStateQuery = omitBy(stateQuery, isEmpty);
  const cleanLocationQuery = omitBy(locationQuery, isEmpty);

  if (isEqual(cleanStateQuery, cleanLocationQuery)) return curQuery;

  const params = omitBy(Object.assign({}, locationQuery, stateQuery), isEmpty);

  let url = params._path || location.pathname;
  unset(params, '_path');

  if (isEqual(curQuery, params) && url === location.pathname) {
    return curQuery;
  }

  if (!isEmpty(params)) {
    url += `?${queryString.stringify(params)}`;
  }

  history.push(url);

  return params;
}
