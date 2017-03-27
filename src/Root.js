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
import LoginCtrl from './components/Login';
import Settings from './components/Settings/Settings';

import getModuleRoutes from './moduleRoutes';
import initialReducers from './initialReducers';


const reducers = { ...initialReducers };

class Root extends Component {

  getChildContext() {
    return { addReducer: this.addReducer.bind(this) };
  }

  addReducer = (key, reducer) => {
    if (reducers[key] === undefined) {
      reducers[key] = reducer;
      this.props.store.replaceReducer(combineReducers({ ...reducers }));
      return true;
    }
    return false;
  }

  render() {
    const { logger, store, okapi, token, disableAuth, currentUser, currentPerms } = this.props;

    function Stripes(x) {
      Object.assign(this, x);
      this.hasPerm = (perm) => {
        if (!this.user.perms) {
          logger.log('perm', `not checking perm '${perm}': no user permissions yet`);
          return false;
        }
        logger.log('perm', `checking perm '${perm}': `, !!this.user.perms[perm]);
        return this.user.perms[perm];
      };
    }

    const stripes = new Stripes({
      logger,
      store,
      okapi,
      user: {
        user: currentUser,
        perms: currentPerms,
      },
    });

    return (
      <Provider store={store}>
        <Router>
          { token != null || disableAuth ?
            <MainContainer>
              <MainNav />
              <ModuleContainer id="content">
                <Switch>
                  <Route exact path="/" component={Front} key="root" />
                  <Route exact path="/settings" render={() => <Settings stripes={stripes} />} />
                  {getModuleRoutes(stripes)}
                  <Route
                    component={() => <div>
                      <h2>Uh-oh!</h2>
                      <p>This route does not exist.</p>
                    </div>}
                  />
                </Switch>
              </ModuleContainer>
            </MainContainer> :
            <LoginCtrl />
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
  okapi: PropTypes.shape({
    url: PropTypes.string.isRequired,
    tenant: PropTypes.string.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    token: state.okapi.token,
    currentUser: state.okapi.currentUser,
    currentPerms: state.okapi.currentPerms,
  };
}

export default connect(mapStateToProps)(Root);
