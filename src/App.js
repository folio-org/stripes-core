import React, { Component, StrictMode } from 'react';
import PropTypes from 'prop-types';
import { okapi as okapiConfig, config } from 'stripes-config';
import merge from 'lodash/merge';

import AppConfigError from './components/AppConfigError';
import connectErrorEpic from './connectErrorEpic';
import configureEpics from './configureEpics';
import configureLogger from './configureLogger';
import configureStore from './configureStore';
import gatherActions from './gatherActions';
import { destroyStore } from './mainActions';
import css from './components/SessionEventContainer/style.css';

import Root from './components/Root';
import { eventsPortal } from './constants';
import { getTenantAndClientIdFromLoginURL } from './loginServices';

const StrictWrapper = ({ children }) => {
  if (config.disableStrictMode) {
    return children;
  }

  return <StrictMode>{children}</StrictMode>;
};

/**
 * isStorageEnabled
 * Return true if local-storage, session-storage, and cookies are all enabled.
 * Return false otherwise.
 * @returns boolean true if storages are enabled; false otherwise.
 */
export const isStorageEnabled = () => {
  let isEnabled = true;
  // local storage
  try {
    localStorage.getItem('test-key');
  } catch (e) {
    console.warn('local storage is disabled'); // eslint-disable-line no-console
    isEnabled = false;
  }

  // session storage
  try {
    sessionStorage.getItem('test-key');
  } catch (e) {
    console.warn('session storage is disabled'); // eslint-disable-line no-console
    isEnabled = false;
  }

  // cookies
  if (!navigator.cookieEnabled) {
    console.warn('cookies are disabled'); // eslint-disable-line no-console
    isEnabled = false;
  }

  return isEnabled;
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

    if (isStorageEnabled()) {
      const parsedTenant = getTenantAndClientIdFromLoginURL();

      const okapi = (typeof okapiConfig === 'object' && Object.keys(okapiConfig).length > 0)
        ? { ...okapiConfig, tenant: parsedTenant?.tenantName || okapiConfig.tenant, clientId: parsedTenant?.clientId || okapiConfig.clientId } : { withoutOkapi: true };

      const initialState = merge({}, { okapi }, props.initialState);

      this.logger = configureLogger(config);
      this.epics = configureEpics(connectErrorEpic);
      this.store = configureStore(initialState, this.logger, this.epics);
      this.actionNames = gatherActions();

      this.state = { isStorageEnabled: true };
    } else {
      this.state = { isStorageEnabled: false };
    }
  }

  componentWillUnmount() {
    this.store.dispatch(destroyStore());
  }

  render() {
    // Stripes requires cookies (for login) and session and local storage
    // (for session state and all manner of things). If these are not enabled,
    // stop and show an error message.
    if (!this.state.isStorageEnabled) {
      return <AppConfigError />;
    }

    // no need to pass along `initialState`
    // eslint-disable-next-line no-unused-vars
    const { initialState, ...props } = this.props;

    return (
      <StrictWrapper>
        <div
          id={eventsPortal}
          className={css.eventsContainer}
        />
        <Root
          store={this.store}
          epics={this.epics}
          logger={this.logger}
          config={config}
          actionNames={this.actionNames}
          disableAuth={(config?.disableAuth) || false}
          {...props}
        />
      </StrictWrapper>
    );
  }
}
