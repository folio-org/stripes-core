import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { okapi as okapiConfig, config } from 'stripes-config';

import connectErrorEpic from './connectErrorEpic';
import configureEpics from './configureEpics';
import configureLogger from './configureLogger';
import configureStore from './configureStore';
import { discoverServices } from './discoverServices';
import gatherActions from './gatherActions';

import Root from './components/Root';

export default class StripesCore extends Component {
  static propTypes = {
    history: PropTypes.object
  };

  constructor(props) {
    super(props);

    const okapi = (typeof okapiConfig === 'object' && Object.keys(okapiConfig).length > 0)
      ? okapiConfig : { withoutOkapi: true };

    this.logger = configureLogger(config);
    this.logger.log('core', 'Starting Stripes ...');

    this.epics = configureEpics(connectErrorEpic);
    this.store = configureStore({ okapi }, this.logger, this.epics);
    if (!okapi.withoutOkapi) discoverServices(this.store);

    this.actionNames = gatherActions();
  }

  render() {
    return (
      <Root
        store={this.store}
        epics={this.epics}
        logger={this.logger}
        config={config}
        actionNames={this.actionNames}
        disableAuth={(config && config.disableAuth) || false}
        {...this.props}
      />
    );
  }
}
