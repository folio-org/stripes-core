import { connect, connectFor } from '@folio/stripes-connect';
import { withRoot } from './RootContext';

export function rootConnect(...args) {
  return connect(...args, withRoot);
}

export function rootConnectFor(...args) {
  return connectFor(...args, withRoot);
}
