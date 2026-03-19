import React, { Component, StrictMode } from 'react';
import PropTypes from 'prop-types';
import { okapi as localOkapi, branding as localBranding, config as localConfig } from 'stripes-config';
import isEmpty from 'lodash/isEmpty';
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
import { eventsPortal, stripesHubAPI } from './constants';
import { getLoginTenant } from './loginServices';


const StrictWrapper = ({ children, config }) => {
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

export const getStripesHubConfig = () => {
  try {
    const folioConfig = JSON.parse(localStorage.getItem(stripesHubAPI.FOLIO_CONFIG_KEY) || '{}');
    const brandingConfig = JSON.parse(localStorage.getItem(stripesHubAPI.BRANDING_CONFIG_KEY) || '{}');
    return { folioConfig, brandingConfig };
  } catch (error) {
    console.error('Failed to parse StripesHub config from localStorage:', error); // eslint-disable-line no-console
    // If there was an error parsing the config from StripesHub, return empty objects so that we fall back to stripes.config.js values.
    return { folioConfig: {}, brandingConfig: {} };
  }
};

/**
 * If StripesHub is present in localstorage, override config values as StripesHub is now the source of truth.
 *
 * @param {object} theLocalOkapi the Okapi config object from stripes.config.js.
 * @param {object} theLocalConfig the Stripes config object from stripes.config.js.
 * @param {object} theLocalBranding the branding config from stripes.config.js.
 * @param {object} stripesHub the config object from StripesHub.
 * @returns Updated config object with values from Stripes Hub if available, or default to stripes.config.js
 */
export const getOverrideConfig = (theLocalOkapi, theLocalConfig, theLocalBranding, stripesHub) => {
  let stripesConfig = {};
  let stripesOkapi = {};
  let stripesBranding = {};

  // If folioConfig is present in StripesHub, use it to override values from stripes.config.js.
  // Otherwise, use values from stripes.config.js.
  if (stripesHub && !isEmpty(stripesHub.folioConfig)) {
    // Pass URLs from FOLIO config into Okapi config.
    stripesOkapi.url = stripesHub.folioConfig.gatewayUrl;
    stripesOkapi.authnUrl = stripesHub.folioConfig.authnUrl;

    // Pass all FOLIO config values from StripesHub config into Stripes config.
    stripesConfig = stripesHub.folioConfig;

    // Remove URLs that StripesHub consolidates into FOLIO config, but classic Stripes expects to find in Okapi config.
    delete stripesConfig.gatewayUrl;
    delete stripesConfig.authnUrl;

    stripesBranding = stripesHub.brandingConfig;
  } else {
    stripesOkapi = theLocalOkapi;
    stripesConfig = theLocalConfig;
    stripesBranding = theLocalBranding;
  }

  return { stripesOkapi, stripesConfig, stripesBranding };
};

StrictWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  config: PropTypes.object.isRequired,
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
      const { stripesOkapi, stripesConfig, stripesBranding } = getOverrideConfig(localOkapi, localConfig, localBranding, stripesHubConfig);
      const parsedTenant = getLoginTenant(localOkapi, stripesConfig);

      const okapi = (typeof stripesOkapi === 'object' && Object.keys(stripesOkapi).length > 0)
        ? { ...stripesOkapi, ...parsedTenant } : { withoutOkapi: true };

      const initialState = merge({}, { okapi, config: stripesConfig }, props.initialState);

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
      this.config = localConfig;
      this.branding = localBranding;
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
        const hostUrl = await localforage.getItem(stripesHubAPI.HOST_URL_KEY);
        const remotesList = await localforage.getItem(stripesHubAPI.REMOTE_LIST_KEY);

        const actionNames = gatherActions(modules);

        this.setState({
          actionNames,
          modules,
          stripesHub: {
            discoveryUrl,
            hostUrl,
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
          disableAuth={(this.config?.disableAuth) || false}
          stripesHub={stripesHub}
          {...props}
        />
      </StrictWrapper>
    );
  }
}
