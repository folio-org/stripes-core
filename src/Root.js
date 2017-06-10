import React, { Component, PropTypes } from 'react';
import { combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import Router from 'react-router-dom/BrowserRouter';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';

import MainContainer from './components/MainContainer';
import MainNav from './components/MainNav';
import ModuleContainer from './components/ModuleContainer';
import { Front } from './components/Front';
import About from './components/About';
import LoginCtrl from './components/Login';
import Settings from './components/Settings/Settings';

import getModuleRoutes from './moduleRoutes';
import initialReducers from './initialReducers';
import enhanceReducer from './enhanceReducer';
import { isVersionCompatible } from './discoverServices.js'


const reducers = { ...initialReducers };

class Root extends Component {

  getChildContext() {
    return { addReducer: this.addReducer.bind(this) };
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
    const { logger, store, config, okapi, token, disableAuth, currentUser, currentPerms, locale, plugins, discovery } = this.props;

    function Stripes(x) {
      Object.assign(this, x);
      this.hasPerm = (perm) => {
        if (this.config && this.config.hasAllPerms) {
          logger.log('perm', `assuming perm '${perm}': hasAllPerms is true`);
          return true;
        }
        if (!this.user.perms) {
          logger.log('perm', `not checking perm '${perm}': no user permissions yet`);
          return undefined;
        }
        logger.log('perm', `checking perm '${perm}': `, !!this.user.perms[perm]);
        return this.user.perms[perm] || false;
      };
      this.hasInterface = (name, versionWanted) => {
        if (!this.discovery || !this.discovery.interfaces) {
          logger.log('interface', `not checking interface '${name}': no discovery yet`);
          return undefined;
        }
        const version = this.discovery.interfaces[name];
        if (!version) {
          logger.log('interface', `interface '${name}' is missing`);
          return undefined;
        }
        const ok = isVersionCompatible(version, versionWanted);
        const cond = ok ? 'is' : 'is not';
        logger.log('interface', `interface '${name}' v${versionWanted} ${cond} compatible with available v${version}`);
        return ok ? version : 0;
      };
    }

    const stripes = new Stripes({
      logger,
      store,
      config,
      okapi,
      locale,
      plugins: plugins || {},
      discovery,
      user: {
        user: currentUser,
        perms: currentPerms,
      },
    });

    return (
      <Provider store={store}>
        <Router>
          { token == null && !disableAuth ?
            <LoginCtrl autoLogin={config.autoLogin} /> :
            <MainContainer>
              <MainNav stripes={stripes} />
              <ModuleContainer id="content">
                <Switch>
                  <Route exact path="/" component={Front} key="root" />
                  <Route path="/about" component={About} key="about" />
                  <Route path="/settings" render={() => <Settings stripes={stripes} />} />
                  {getModuleRoutes(stripes)}
                  <Route
                    component={() => <div>
                      <h2>Uh-oh!</h2>
                      <p>This route does not exist.</p>
                    </div>}
                  />
                </Switch>
              </ModuleContainer>
            </MainContainer>
          }
        </Router>
      </Provider>
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
  locale: PropTypes.string,
  plugins: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  config: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  okapi: PropTypes.shape({
    url: PropTypes.string.isRequired,
    tenant: PropTypes.string.isRequired,
  }).isRequired,
  discovery: PropTypes.shape({
    modules: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    interfaces: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }),
};

function mapStateToProps(state) {
  return {
    token: state.okapi.token,
    currentUser: state.okapi.currentUser,
    currentPerms: state.okapi.currentPerms,
    locale: state.okapi.locale,
    plugins: state.okapi.plugins,
    discovery: state.discovery,
  };
}

export default connect(mapStateToProps)(Root);
