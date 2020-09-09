// This webpack plugin generates a virtual module containing the
// error-handler configuration.

const logger = require('./logger')('stripesErrorLoggingPlugin');

module.exports = class StripesErrorLoggingPlugin {
  constructor(options) {
    logger.log('initializing...');

    const defaultErrorLogging = {
      rollbar: null,
      bugsnag: null,
      sentry: null,
    };

    const tenantErrorLogging = (options && options.tenantErrorLogging) ? options.tenantErrorLogging : {};
    this.errorLogging = Object.assign({}, defaultErrorLogging, tenantErrorLogging);
  }

  apply(compiler) {
    // Hook into stripesConfigPlugin to supply errorHandler config
    compiler.hooks.stripesConfigPluginBeforeWrite.tap('StripesErrorLoggingPlugin', (config) => {
      config.errorLogging = this.errorLogging;
      logger.log('stripesConfigPluginBeforeWrite', config.errorHandler);
    });
  }
};
