import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import { IntlProvider } from 'react-intl';
import queryString from 'query-string';
import { ApolloProvider } from 'react-apollo';

import initialReducers from '../../initialReducers';
import enhanceReducer from '../../enhanceReducer';
import createApolloClient from '../../createApolloClient';
import { setSinglePlugin, setBindings, setOkapiToken } from '../../okapiActions';
import { loadTranslations, checkOkapiSession } from '../../loginServices';
import { getQueryResourceKey } from '../../locationService';
import Stripes from '../../Stripes';
import RootWithIntl from '../../RootWithIntl';

import './Root.css';

import { modules } from 'stripes-config'; // eslint-disable-line

class Root extends Component {
  constructor(...args) {
    super(...args);
    this.reducers = { ...initialReducers };
    this.epics = {};
    this.withOkapi = this.props.okapi.withoutOkapi !== true;

    const appModule = modules.app.find(m => window.location.pathname.startsWith(m.route) && m.queryResource);
    this.queryResourceStateKey = (appModule) ? getQueryResourceKey(appModule) : null;
  }

  getChildContext() {
    return { addReducer: this.addReducer, addEpic: this.addEpic };
  }

  componentWillMount() {
    const { okapi, store, locale } = this.props;
    if (this.withOkapi) checkOkapiSession(okapi.url, store, okapi.tenant);
    // TODO: remove this after we load locale and translations at start from a public endpoint
    loadTranslations(store, locale);
  }

  shouldComponentUpdate(nextProps) {
    return !this.withOkapi || nextProps.okapiReady;
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
    const { logger, store, epics, config, okapi, actionNames, token, disableAuth, currentUser, currentPerms, locale, plugins, bindings, discovery, translations, history } = this.props;

    if (!translations) return (<div />);

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
      setLocale: (val) => { loadTranslations(store, val); },
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
      <ApolloProvider client={createApolloClient(okapi)}>
        <IntlProvider locale={locale} key={locale} messages={translations}>
          <RootWithIntl stripes={stripes} token={token} disableAuth={disableAuth} history={history} />
        </IntlProvider>
      </ApolloProvider>
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
  logger: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  currentPerms: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  currentUser: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  epics: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  locale: PropTypes.string,
  translations: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  plugins: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  bindings: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  config: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  okapi: PropTypes.shape({
    url: PropTypes.string,
    tenant: PropTypes.string,
    withoutOkapi: PropTypes.bool,
  }),
  actionNames: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  discovery: PropTypes.shape({
    modules: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    interfaces: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isFinished: PropTypes.bool,
  }),
  history: PropTypes.shape({
    length: PropTypes.number.isRequired,
    action: PropTypes.string.isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  okapiReady: PropTypes.bool,
};

Root.defaultProps = {
  history: createBrowserHistory(),
  // TODO: remove after locale is accessible from a global config / public url
  locale: 'en-US',
  okapiReady: false,
};

function mapStateToProps(state) {
  return {
    token: state.okapi.token,
    currentUser: state.okapi.currentUser,
    currentPerms: state.okapi.currentPerms,
    locale: state.okapi.locale,
    translations: state.okapi.translations,
    plugins: state.okapi.plugins,
    bindings: state.okapi.bindings,
    discovery: state.discovery,
    okapiReady: state.okapi.okapiReady,
    okapi: state.okapi,
  };
}

export default connect(mapStateToProps)(Root);
