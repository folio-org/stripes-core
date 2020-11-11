import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import { createBrowserHistory } from 'history';
import { IntlProvider } from 'react-intl';
import queryString from 'query-string';
import { ApolloProvider } from '@apollo/client';
import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';
import { metadata, icons } from 'stripes-config';

/* ConnectContext - formerly known as RootContext, now comes from stripes-connect, so stripes-connect
* is providing the infrastructure for store connectivity to the system. This eliminates a circular
* dependency between stripes-connect and stripes-core. STCON-76
*/
import { ConnectContext } from '@folio/stripes-connect';
import initialReducers from '../../initialReducers';
import enhanceReducer from '../../enhanceReducer';
import createApolloClient from '../../createApolloClient';
import { setSinglePlugin, setBindings, setOkapiToken, setTimezone, setCurrency } from '../../okapiActions';
import { loadTranslations, checkOkapiSession } from '../../loginServices';
import { getQueryResourceKey, getCurrentModule } from '../../locationService';
import Stripes from '../../Stripes';
import RootWithIntl from '../../RootWithIntl';
import SystemSkeleton from '../SystemSkeleton';

import './Root.css';

import { withModules } from '../Modules';

if (!metadata) {
  // eslint-disable-next-line no-console
  console.error('No metadata harvested from package files, so you will not get app icons. Probably the stripes-core in your Stripes CLI is too old. Try `yarn global upgrade @folio/stripes-cli`');
}

class Root extends Component {
  constructor(...args) {
    super(...args);
    this.reducers = { ...initialReducers };
    this.epics = {};
    this.withOkapi = this.props.okapi.withoutOkapi !== true;

    const { modules, history } = this.props;
    const appModule = getCurrentModule(modules, history.location);
    this.queryResourceStateKey = (appModule) ? getQueryResourceKey(appModule) : null;
  }

  getChildContext() {
    return { addReducer: this.addReducer, addEpic: this.addEpic };
  }

  componentDidMount() {
    const { okapi, store, locale, defaultTranslations } = this.props;
    if (this.withOkapi) checkOkapiSession(okapi.url, store, okapi.tenant);
    // TODO: remove this after we load locale and translations at start from a public endpoint
    loadTranslations(store, locale, defaultTranslations);
  }

  shouldComponentUpdate(nextProps) {
    return !this.withOkapi || nextProps.okapiReady || nextProps.serverDown;
  }

  addReducer = (key, reducer) => {
    if (this.queryResourceStateKey === key) {
      const originalReducer = reducer;
      const initialQueryObject = queryString.parse(window.location.search);
      // eslint-disable-next-line no-param-reassign
      reducer = (state = Object.values(initialQueryObject).length ? initialQueryObject : undefined, action) => originalReducer(state, action);
    }

    if (this.reducers[key] === undefined) {
      this.reducers[key] = reducer;
      this.props.store.replaceReducer(enhanceReducer(combineReducers({ ...this.reducers })));
      return true;
    }
    return false;
  }

  addEpic = (key, epic) => {
    if (this.epics[key] === undefined) {
      this.epics[key] = epic;
      this.props.epics.add(epic);
      return true;
    }
    return false;
  }

  render() {
    const { logger, store, epics, config, okapi, actionNames, token, disableAuth, currentUser, currentPerms, locale, defaultTranslations, timezone, currency, plugins, bindings, discovery, translations, history, serverDown } = this.props;

    if (serverDown) {
      return <div>Error: server is down.</div>;
    }

    if (!translations) {
      // We don't know the locale, so we use English as backup
      return (<SystemSkeleton />);
    }

    const stripes = new Stripes({
      logger,
      store,
      epics,
      config,
      okapi,
      withOkapi: this.withOkapi,
      setToken: (val) => { store.dispatch(setOkapiToken(val)); },
      actionNames,
      locale,
      timezone,
      currency,
      metadata,
      icons,
      setLocale: (localeValue) => { loadTranslations(store, localeValue, defaultTranslations); },
      setTimezone: (timezoneValue) => { store.dispatch(setTimezone(timezoneValue)); },
      setCurrency: (currencyValue) => { store.dispatch(setCurrency(currencyValue)); },
      plugins: plugins || {},
      setSinglePlugin: (key, value) => { store.dispatch(setSinglePlugin(key, value)); },
      bindings,
      setBindings: (val) => { store.dispatch(setBindings(val)); },
      discovery,
      user: {
        user: currentUser,
        perms: currentPerms,
      },
      connect(X) { return X; },
    });

    return (
      <ErrorBoundary>
        <ConnectContext.Provider value={{ addReducer: this.addReducer, addEpic: this.addEpic, store }}>
          <ApolloProvider client={createApolloClient(okapi)}>
            <IntlProvider
              locale={locale}
              key={locale}
              timeZone={timezone}
              currency={currency}
              messages={translations}
              textComponent={Fragment}
              onError={config?.suppressIntlErrors ? () => {} : undefined}
            >
              <RootWithIntl
                stripes={stripes}
                token={token}
                disableAuth={disableAuth}
                history={history}
              />
            </IntlProvider>
          </ApolloProvider>
        </ConnectContext.Provider>
      </ErrorBoundary>
    );
  }
}

Root.childContextTypes = {
  addReducer: PropTypes.func,
  addEpic: PropTypes.func,
};

Root.propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
    replaceReducer: PropTypes.func.isRequired,
  }),
  token: PropTypes.string,
  disableAuth: PropTypes.bool.isRequired,
  logger: PropTypes.object.isRequired,
  currentPerms: PropTypes.object,
  currentUser: PropTypes.object,
  epics: PropTypes.object,
  locale: PropTypes.string,
  defaultTranslations: PropTypes.object,
  timezone: PropTypes.string,
  currency: PropTypes.string,
  translations: PropTypes.object,
  modules: PropTypes.shape({
    app: PropTypes.array,
  }),
  plugins: PropTypes.object,
  bindings: PropTypes.object,
  config: PropTypes.object,
  okapi: PropTypes.shape({
    url: PropTypes.string,
    tenant: PropTypes.string,
    withoutOkapi: PropTypes.bool,
  }),
  actionNames: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  discovery: PropTypes.shape({
    modules: PropTypes.object,
    interfaces: PropTypes.object,
    isFinished: PropTypes.bool,
  }),
  history: PropTypes.shape({
    action: PropTypes.string.isRequired,
    length: PropTypes.number.isRequired,
    location: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  okapiReady: PropTypes.bool,
  serverDown: PropTypes.bool,
};

Root.defaultProps = {
  history: createBrowserHistory(),
  // TODO: remove after locale is accessible from a global config / public url
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
  okapiReady: false,
  serverDown: false,
};

function mapStateToProps(state) {
  return {
    token: state.okapi.token,
    currentUser: state.okapi.currentUser,
    currentPerms: state.okapi.currentPerms,
    locale: state.okapi.locale,
    timezone: state.okapi.timezone,
    currency: state.okapi.currency,
    translations: state.okapi.translations,
    plugins: state.okapi.plugins,
    bindings: state.okapi.bindings,
    discovery: state.discovery,
    okapiReady: state.okapi.okapiReady,
    serverDown: state.okapi.serverDown,
    okapi: state.okapi,
  };
}

export default connect(mapStateToProps)(withModules(Root));
