import React, { Component, PropTypes } from 'react';
import { combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import Router from 'react-router/BrowserRouter';
import Match from 'react-router/Match';
import Miss from 'react-router/Miss';

import MainContainer from './components/MainContainer';
import MainNav from './components/MainNav';
import ModuleContainer from './components/ModuleContainer';
import { Front } from './components/Front';
import LoginCtrl from './components/Login';
// import Settings from './components/Settings/Settings';

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
    const { logger, store, token, disableAuth } = this.props;
    return (
      <Provider store={store}><Router>
        { token != null || disableAuth ?
          <MainContainer>
            <MainNav />
            <ModuleContainer id="content">
              <Match pattern="/" exactly component={Front} key="root" />
              {/* <Match pattern="/settings" exactly component={Settings} /> */}
              {getModuleRoutes(logger, this.props.currentPerms)}
              <Miss
                component={() => <div>
                  <h2>Uh-oh!</h2>
                  <p>This route does not exist.</p>
                </div>}
              />
            </ModuleContainer>
          </MainContainer>
        : <LoginCtrl /> }
      </Router></Provider>
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
};

function mapStateToProps(state) {
  return {
    token: state.okapi.token,
    currentUser: state.okapi.currentUser,
    currentPerms: state.okapi.currentPerms,
  };
}

export default connect(mapStateToProps)(Root);
