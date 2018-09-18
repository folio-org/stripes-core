const webpack = require('webpack');

const miragePlugin = {
  // Standard yargs options object
  options: {
    'mirage [scenario]': {
      describe: 'Enable Mirage Server and specify a scenario',
      type: 'string',
      group: 'Mirage Server'
    },
  },

  // Stripes CLI hook into "webpackOverrides"
  beforeBuild: (options) => {
    const mirageOption = options.mirage === true ? 'default' : options.mirage;

    return (config) => {
      config.plugins.push(new webpack.EnvironmentPlugin({
        MIRAGE_SCENARIO: mirageOption || 'default'
      }));

      if (!!mirageOption) {
        console.info('Using Mirage Server'); // eslint-disable-line no-console

        return Object.assign({}, config, {
          entry: ['./test/bigtest/network/boot'].concat(config.entry)
        });
      } else {
        return config;
      }
    };
  }
}

module.exports = {
  hasAllPerms: true,

  aliases: {
    '@folio/stripes-core': '.'
  },

  // Custom command extension
  plugins: {
    serve: miragePlugin
  }
};
