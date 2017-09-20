import React from 'react';
import PropTypes from 'prop-types';
import Router from 'react-router-dom/Router';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { HotKeys } from '@folio/stripes-components/lib/HotKeys';
import { intlShape } from 'react-intl';

import MainContainer from './components/MainContainer';
import MainNav from './components/MainNav';
import ModuleContainer from './components/ModuleContainer';
import Front from './components/Front';
import About from './components/About';
import SSOLanding from './components/SSOLanding';
import SSORedirect from './components/SSORedirect';
import Settings from './components/Settings/Settings';
import LoginCtrl from './components/Login';
import getModuleRoutes from './moduleRoutes';
import { stripesShape } from './Stripes';

const RootWithIntl = (props, context) => {
  const intl = context.intl;
  const stripes = props.stripes.clone({ intl });
  const { token, disableAuth, history } = props;

  return (
    <HotKeys keyMap={stripes.bindings} noWrapper>
      <Provider store={stripes.store}>
        <Router history={history}>
          { token || disableAuth ?
            <MainContainer>
              <MainNav stripes={stripes} />
              <ModuleContainer id="content">
                <Switch>
                  <Route exact path="/" component={() => <Front stripes={stripes} />} key="root" />
                  <Route path="/sso-landing" component={() => <SSORedirect stripes={stripes} />} key="sso-landing" />
                  <Route path="/about" component={() => <About stripes={stripes} />} key="about" />
                  <Route path="/settings" render={() => <Settings stripes={stripes} />} />
                  {getModuleRoutes(stripes)}
                  <Route
                    component={() => (<div>
                      <h2>Uh-oh!</h2>
                      <p>This route does not exist.</p>
                    </div>)}
                  />
                </Switch>
              </ModuleContainer>
            </MainContainer> :
            <Switch>
              <Route exact path="/sso-landing" component={() => <CookiesProvider><SSOLanding stripes={stripes} /></CookiesProvider>} key="sso-landing" />
              <Route component={() => <LoginCtrl autoLogin={stripes.config.autoLogin} />} />
            </Switch>
          }
        </Router>
      </Provider>
    </HotKeys>
  );
};

RootWithIntl.contextTypes = {
  intl: intlShape.isRequired,
};

RootWithIntl.propTypes = {
  stripes: stripesShape.isRequired,
  token: PropTypes.string,
  disableAuth: PropTypes.bool.isRequired,
  history: PropTypes.shape({}),
};

export default RootWithIntl;
