import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import createBrowserHistory from 'history/createBrowserHistory';
import { IntlProvider } from 'react-intl';

import initialReducers from './initialReducers';
import enhanceReducer from './enhanceReducer';
import { setLocale, setSinglePlugin, setBindings, setOkapiToken } from './okapiActions';
import { loadTranslations } from './loginServices';
import Stripes from './Stripes';
import RootWithIntl from './RootWithIntl';

const reducers = { ...initialReducers };

class Root extends Component {

  getChildContext() {
    return { addReducer: this.addReducer.bind(this) };
  }

  componentWillMount() {
    // TODO: remove this after we load locale and translations at start from a public endpoint
    loadTranslations(this.props.store, this.props.locale);
  }

  addReducer = (key, reducer) => {
    if (reducers[key] === undefined) {
      reducers[key] = reducer;
      this.props.store.replaceReducer(enhanceReducer(combineReducers({ ...reducers })));
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
      setToken: (val) => { store.dispatch(setOkapiToken(val)); },
      actionNames,
      locale,
      // At some point, setLocale will also need to update the translations
      setLocale: (val) => { store.dispatch(setLocale(val)); },
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
      <IntlProvider locale={locale} key={locale} messages={translations}>
        <RootWithIntl stripes={stripes} token={token} disableAuth={disableAuth} history={history} />
      </IntlProvider>
    );
  }
}

Root.childContextTypes = {
  addReducer: PropTypes.func,
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
    url: PropTypes.string.isRequired,
    tenant: PropTypes.string.isRequired,
  }).isRequired,
  actionNames: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  discovery: PropTypes.shape({
    modules: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    interfaces: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }),
  history: PropTypes.shape({
    length: PropTypes.number.isRequired,
    action: PropTypes.string.isRequired,
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
};

Root.defaultProps = {
  history: createBrowserHistory(),
  // TODO: remove after locale is accessible from a global config / public url
  locale: 'en-US',
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
  };
}

export default connect(mapStateToProps)(Root);
