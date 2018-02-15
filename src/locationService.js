import { snakeCase, isEqual, omitBy, isNil, isEmpty } from 'lodash';
import queryString from 'query-string';
import { replaceQueryResource } from './locationActions';

export function getQueryResourceKey(module) {
  return `${module.dataKey ? `${module.dataKey}#` : ''}${snakeCase(module.module)}_${module.queryResource}`;
}

export function getQueryResourceState(module, store) {
  const key = getQueryResourceKey(module);
  return store.getState()[key];
}

// updates query resource based on the current location query
export function updateQueryResource(location, module, store) {
  const stateQuery = getQueryResourceState(module, store);
  const locationQuery = location.query ? location.query : queryString.parse(location.search);

  if (isEqual(stateQuery, locationQuery)) return;
  store.dispatch(replaceQueryResource(module, locationQuery));
}

// updates location query based on the change in the query resource
export function updateLocation(module, store, history, location) {
  if (!module || !module.queryResource || !location.pathname.startsWith(module.route)) return;

  const stateQuery = getQueryResourceState(module, store);
  const locationQuery = location.query ? location.query : queryString.parse(location.search);

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
