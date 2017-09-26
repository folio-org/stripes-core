import _ from 'lodash';
import Logger from '@folio/stripes-logger';

export default function configureLogger(config) {
  const categories = _.get(config, ['logCategories'], 'core,action,xhr');
  const prefix = _.get(config, ['logPrefix'], 'stripes');
  const timestamp = _.get(config, ['logTimestamp'], false);

  return new Logger(categories, prefix, timestamp);
}
