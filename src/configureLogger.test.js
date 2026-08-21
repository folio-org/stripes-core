import configureLogger from './configureLogger';

describe('configureLogger', () => {
  it('without an argument, returns a logger with default values', () => {
    const logger = configureLogger();

    expect(logger.categories).toEqual('core,action,xhr');
    expect(logger.prefix).toEqual('stripes');
    expect(logger.timestamp).toBe(false);
  });

  it('with a config argument, returns a logger with custom values', () => {
    const config = {
      logCategories: 'monkey',
      logPrefix: 'bagel',
      logTimestamp: true,
    };
    const logger = configureLogger(config);

    expect(logger.categories).toEqual(config.logCategories);
    expect(logger.prefix).toEqual(config.logPrefix);
    expect(logger.timestamp).toBe(config.logTimestamp);
  });
});
