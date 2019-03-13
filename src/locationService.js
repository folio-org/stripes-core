import { snakeCase, isEqual, forOwn, isEmpty, unset } from 'lodash';
import queryString from 'query-string';
import { replaceQueryResource } from './locationActions';

export function getLocationQuery(location) {
  return location.query ? location.query : queryString.parse(location.search);
}

function removeEmpty(obj) {
  const cleanObj = {};
  forOwn(obj, (value, key) => {
    if (value) cleanObj[key] = value;
  });

  return cleanObj;
}

export function getQueryResourceKey({ dataKey, module, queryResource }) {
  const prefix = dataKey ? `${dataKey}#` : '';
  return `${prefix}${snakeCase(module)}_${queryResource}`;
}

export function getQueryResourceState(module, store) {
  const key = getQueryResourceKey(module);
  return store.getState()[key];
}

export function isQueryResourceModule(module, location) {
  if (!module) return false;

  const path = location.pathname;
  const re = new RegExp(`^${module.route}|^/settings${module.route}`, 'i');

  return module.queryResource && path.match(re);
}

export function getCurrentModule(modules, location) {
  const { app, settings } = modules;
  return app.concat(settings).find(m => isQueryResourceModule(m, location));
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
  const cleanStateQuery = removeEmpty(stateQuery);
  const cleanLocationQuery = removeEmpty(locationQuery);

  if (isEqual(cleanStateQuery, cleanLocationQuery)) {
    return cleanLocationQuery;
  }

  const params = removeEmpty(Object.assign({}, locationQuery, stateQuery));

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
