import React, { Component, StrictMode } from 'react';
import PropTypes from 'prop-types';
import { okapi as okapiConfig, branding, config } from 'stripes-config';
import merge from 'lodash/merge';
import localforage from 'localforage';
import AppConfigError from './components/AppConfigError';
import connectErrorEpic from './connectErrorEpic';
import configureEpics from './configureEpics';
import configureLogger from './configureLogger';
import configureStore from './configureStore';
import gatherActions from './gatherActions';
import { destroyStore } from './mainActions';
import { getModules } from './entitlementService';
import { modulesInitialState } from './ModulesContext';
import css from './components/SessionEventContainer/style.css';

import Root from './components/Root';
import { getStripesHubConfig, getOverrideConfig } from './components/Root/stripes-hub-util';
import { eventsPortal, stripesHubAPI } from './constants';
import { getLoginTenant } from './loginServices';


const StrictWrapper = ({ children }, config) => {
  if (config?.disableStrictMode) {
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
      const stripesHubConfig = getStripesHubConfig();
      const { stripesOkapi, stripesConfig, stripesBranding } = getOverrideConfig(okapiConfig, config, branding, stripesHubConfig);
      const parsedTenant = getLoginTenant(okapiConfig, stripesConfig);

      const okapi = (typeof stripesOkapi === 'object' && Object.keys(stripesOkapi).length > 0)
        ? { ...stripesOkapi, ...parsedTenant } : { withoutOkapi: true };

      const initialState = merge({}, { okapi }, props.initialState);

      this.config = stripesConfig;
      this.branding = stripesBranding;
      this.logger = configureLogger(stripesConfig);
      this.epics = configureEpics(connectErrorEpic);
      this.store = configureStore(initialState, this.logger, this.epics);

      this.state = {
        isStorageEnabled: true,
        actionNames: [],
        modules: modulesInitialState,
      };
    } else {
      this.config = config;
      this.branding = branding;
      this.state = {
        isStorageEnabled: false,
        actionNames: [],
        modules: modulesInitialState,
      };
    }
  }

  async componentDidMount() {
    if (this.state.isStorageEnabled) {
      try {
        const modules = await getModules(this.config);

        const discoveryUrl = await localforage.getItem(stripesHubAPI.DISCOVERY_URL_KEY);
        const hostLocation = await localforage.getItem(stripesHubAPI.HOST_LOCATION_KEY);
        const remotesList = await localforage.getItem(stripesHubAPI.REMOTE_LIST_KEY);

        const actionNames = gatherActions(modules);

        this.setState({
          actionNames,
          modules,
          stripesHub: {
            discoveryUrl,
            hostLocation,
            remotesList,
          }
        });
      } catch (error) {
        console.error('Failed to gather actions:', error); // eslint-disable-line no-console
      }
    }
  }

  componentWillUnmount() {
    this.store.dispatch(destroyStore());
  }

  render() {
    const {
      actionNames,
      modules,
      stripesHub,
    } = this.state;
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
      <StrictWrapper config={this.config}>
        <div
          id={eventsPortal}
          className={css.eventsContainer}
        />
        <Root
          store={this.store}
          epics={this.epics}
          logger={this.logger}
          config={this.config}
          branding={this.branding}
          actionNames={actionNames}
          modules={modules}
          disableAuth={(config?.disableAuth) || false}
          stripesHub={stripesHub}
          {...props}
        />
      </StrictWrapper>
    );
  }
}
