import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import { createBrowserHistory } from 'history';
import { IntlProvider } from 'react-intl';
import queryString from 'query-string';
import { QueryClientProvider } from 'react-query';
import { SWRConfig } from 'swr';
import { ApolloProvider } from '@apollo/client';

import { ErrorBoundary } from '@folio/stripes-components';
import { metadata, icons } from 'stripes-config';

/* ConnectContext - formerly known as RootContext, now comes from stripes-connect, so stripes-connect
* is providing the infrastructure for store connectivity to the system. This eliminates a circular
* dependency between stripes-connect and stripes-core. STCON-76
*/
import { ConnectContext } from '@folio/stripes-connect';
import initialReducers from '../../initialReducers';
import enhanceReducer from '../../enhanceReducer';
import createApolloClient from '../../createApolloClient';
import createReactQueryClient from '../../createReactQueryClient';
import createSwrOptions from '../../createSwrOptions';
import { setSinglePlugin, setBindings, setOkapiToken, setTimezone, setCurrency, updateCurrentUser } from '../../okapiActions';
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

    const { modules, history, okapi } = this.props;

    this.reducers = { ...initialReducers };
    this.epics = {};
    this.withOkapi = okapi.withoutOkapi !== true;

    const appModule = getCurrentModule(modules, history.location);
    this.queryResourceStateKey = (appModule) ? getQueryResourceKey(appModule) : null;
    this.defaultRichTextElements = {
      b: (chunks) => <b>{chunks}</b>,
      i: (chunks) => <i>{chunks}</i>,
      em: (chunks) => <em>{chunks}</em>,
      strong: (chunks) => <strong>{chunks}</strong>,
      span: (chunks) => <span>{chunks}</span>,
      div: (chunks) => <div>{chunks}</div>,
      p: (chunks) => <p>{chunks}</p>,
      ul: (chunks) => <ul>{chunks}</ul>,
      ol: (chunks) => <ol>{chunks}</ol>,
      li: (chunks) => <li>{chunks}</li>,
      code: (chunks) => <code>{chunks}</code>,
    };

    this.apolloClient = createApolloClient(okapi);
    this.reactQueryClient = createReactQueryClient();
    this.swrOptions = createSwrOptions();
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
      updateUser: (userValue) => { store.dispatch(updateCurrentUser(userValue)); },
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
          <ApolloProvider client={this.apolloClient}>
            <QueryClientProvider client={this.reactQueryClient}>
              <SWRConfig value={this.swrOptions}>
                <IntlProvider
                  locale={locale}
                  key={locale}
                  timeZone={timezone}
                  currency={currency}
                  messages={translations}
                  textComponent={Fragment}
                  onError={config?.suppressIntlErrors ? () => {} : undefined}
                  onWarn={config?.suppressIntlWarnings ? () => {} : undefined}
                  defaultRichTextElements={this.defaultRichTextElements}
                >
                  <RootWithIntl
                    stripes={stripes}
                    token={token}
                    disableAuth={disableAuth}
                    history={history}
                  />
                </IntlProvider>
              </SWRConfig>
            </QueryClientProvider>
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
    app: PropTypes.arrayOf(PropTypes.object),
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
    bindings: state.okapi.bindings,
    currency: state.okapi.currency,
    currentPerms: state.okapi.currentPerms,
    currentUser: state.okapi.currentUser,
    discovery: state.discovery,
    locale: state.okapi.locale,
    okapi: state.okapi,
    okapiReady: state.okapi.okapiReady,
    plugins: state.okapi.plugins,
    serverDown: state.okapi.serverDown,
    timezone: state.okapi.timezone,
    token: state.okapi.token,
    translations: state.okapi.translations,
  };
}

export default connect(mapStateToProps)(withModules(Root));
