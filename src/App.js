import React, { Component, StrictMode } from 'react';
import PropTypes from 'prop-types';
import { okapi as okapiConfig, config } from 'stripes-config';
import merge from 'lodash/merge';

import connectErrorEpic from './connectErrorEpic';
import configureEpics from './configureEpics';
import configureLogger from './configureLogger';
import configureStore from './configureStore';
import gatherActions from './gatherActions';
import { destroyStore } from './mainActions';

import Root from './components/Root';

const StrictWrapper = ({ children }) => {
  if (config.disableStrictMode) {
    return children;
  }

  return <StrictMode>{children}</StrictMode>;
};

StrictWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default class StripesCore extends Component {
  static propTypes = {
    history: PropTypes.object,
    initialState: PropTypes.object
  };

  constructor(props) {
    super(props);

    const okapi = (typeof okapiConfig === 'object' && Object.keys(okapiConfig).length > 0)
      ? okapiConfig : { withoutOkapi: true };

    const initialState = merge({}, { okapi }, props.initialState);

    this.logger = configureLogger(config);
    this.epics = configureEpics(connectErrorEpic);
    this.store = configureStore(initialState, this.logger, this.epics);
    this.actionNames = gatherActions();
  }

  componentWillUnmount() {
    this.store.dispatch(destroyStore());
  }

  render() {
    // no need to pass along `initialState`
    // eslint-disable-next-line no-unused-vars
    const { initialState, ...props } = this.props;

    return (
      <StrictWrapper>
        <Root
          store={this.store}
          epics={this.epics}
          logger={this.logger}
          config={config}
          actionNames={this.actionNames}
          disableAuth={(config && config.disableAuth) || false}
          {...props}
        />
      </StrictWrapper>
    );
  }
}
