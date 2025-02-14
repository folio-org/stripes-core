import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import { createBrowserHistory } from 'history';
import { IntlProvider } from 'react-intl';
import queryString from 'query-string';
import { QueryClientProvider } from 'react-query';
import { ApolloProvider } from '@apollo/client';

import { ErrorBoundary } from '@folio/stripes-components';
import { metadata, icons } from 'stripes-config';

import { ConnectContext } from '@folio/stripes-connect';
import initialReducers from '../../initialReducers';
import enhanceReducer from '../../enhanceReducer';
import createApolloClient from '../../createApolloClient';
import createReactQueryClient from '../../createReactQueryClient';
import { setSinglePlugin, setBindings, setIsAuthenticated, setOkapiToken, setTimezone, setCurrency, updateCurrentUser } from '../../okapiActions';
import { loadTranslations, checkOkapiSession } from '../../loginServices';
import { getQueryResourceKey, getCurrentModule } from '../../locationService';
import Stripes from '../../Stripes';
import RootWithIntl from '../../RootWithIntl';
import SystemSkeleton from '../SystemSkeleton';
import { configureRtr } from './token-util';

import './Root.css';

import { withModules } from '../Modules';
import { FFetch } from './FFetch';

if (!metadata) {
  // eslint-disable-next-line no-console
  console.error('No metadata harvested from package files, so you will not get app icons. Probably the stripes-core in your Stripes CLI is too old. Try `yarn global upgrade @folio/stripes-cli`');
}

class Root extends Component {
  constructor(...args) {
    super(...args);

    const { modules, history, okapi, store } = this.props;

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

    // enhanced security mode:
    // * configure fetch and xhr interceptors to conduct RTR
    // * see SessionEventContainer for RTR handling
    const rtrConfig = configureRtr(this.props.config.rtr);

    this.ffetch = new FFetch({
      logger: this.props.logger,
      store,
      rtrConfig,
      okapi
    });
    this.ffetch.replaceFetch();
    this.ffetch.replaceXMLHttpRequest();
  }

  componentDidMount() {
    const { okapi, store, defaultTranslations } = this.props;
    if (this.withOkapi) checkOkapiSession(okapi.url, store, okapi.tenant);
    const locale = this.props.config.locale ?? 'en-US';
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
    const { logger, store, epics, config, okapi, actionNames, token, isAuthenticated, disableAuth, currentUser, currentPerms, locale, defaultTranslations, timezone, currency, plugins, bindings, discovery, translations, history, serverDown } = this.props;
    if (serverDown) {
      // note: this isn't i18n'ed because we haven't rendered an IntlProvider yet.
      return <div>Error: server is forbidden, unreachable or down. Clear the cookies? Use incognito mode? VPN issue?</div>;
    }

    if (!translations) {
      // We don't know the locale, so we use English as backup
      return (<SystemSkeleton />);
    }

    // make sure RTR is configured
    // gross: this overwrites whatever is currently stored at config.rtr
    // gross: technically, this may be different than what is configured
    //   in the constructor since the constructor only runs once but
    //   render runs when props change. realistically, that'll never happen
    //   since config values are read only once from a static file at build
    //   time, but still, props are props so technically it's possible.
    config.rtr = configureRtr(this.props.config.rtr);

    const stripes = new Stripes({
      logger,
      store,
      epics,
      config,
      okapi,
      withOkapi: this.withOkapi,
      setToken: (val) => { store.dispatch(setOkapiToken(val)); },
      setIsAuthenticated: (val) => { store.dispatch(setIsAuthenticated(val)); },
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
                  isAuthenticated={isAuthenticated}
                  disableAuth={disableAuth}
                  history={history}
                  queryClient={this.reactQueryClient}
                />
              </IntlProvider>
            </QueryClientProvider>
          </ApolloProvider>
        </ConnectContext.Provider>
      </ErrorBoundary>
    );
  }
}

Root.propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
    replaceReducer: PropTypes.func.isRequired,
  }),
  token: PropTypes.string,
  isAuthenticated: PropTypes.bool,
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
    isAuthenticated: state.okapi.isAuthenticated,
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
