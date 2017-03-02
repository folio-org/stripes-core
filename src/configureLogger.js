import Logger from '@folio/stripes-logger';

export default function configureLogger(config) {
  const categories = config.logCategories || 'path';
  const prefix = config.logPrefix || 'stripes';
  const timestamp = config.logTimestamp || false;

  return new Logger(categories, prefix, timestamp);
}
