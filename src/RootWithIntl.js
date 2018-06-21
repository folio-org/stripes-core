import React from 'react';
import PropTypes from 'prop-types';
import Router from 'react-router-dom/Router';
import Switch from 'react-router-dom/Switch';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { HotKeys } from '@folio/stripes-components/lib/HotKeys';
import { connectFor } from '@folio/stripes-connect';
import { intlShape } from 'react-intl';

import MainContainer from './components/MainContainer';
import MainNav from './components/MainNav';
import ModuleContainer from './components/ModuleContainer';
import TitledRoute from './components/TitledRoute';
import Front from './components/Front';
import SSOLanding from './components/SSOLanding';
import SSORedirect from './components/SSORedirect';
import Settings from './components/Settings/Settings';
import TitleManager from './components/TitleManager';
import LoginCtrl from './components/Login';
import OverlayContainer from './components/OverlayContainer';
import getModuleRoutes from './moduleRoutes';
import { stripesShape } from './Stripes';
import { StripesContext } from './StripesContext';

const RootWithIntl = (props, context) => {
  const intl = context.intl;
  const connect = connectFor('@folio/core', props.stripes.epics, props.stripes.logger);
  const stripes = props.stripes.clone({ intl, connect });
  const { token, disableAuth, history } = props;
  return (
    <StripesContext.Provider value={stripes}>
      <TitleManager>
        <HotKeys keyMap={stripes.bindings} noWrapper>
          <Provider store={stripes.store}>
            <Router history={history}>
              { token || disableAuth ?
                <MainContainer>
                  <OverlayContainer />
                  <MainNav stripes={stripes} />
                  { (stripes.okapi !== 'object' || stripes.discovery.isFinished) && (
                    <ModuleContainer id="content">
                      <Switch>
                        <TitledRoute displayName="Home" path="/" key="root" exact component={<Front stripes={stripes} />} />
                        <TitledRoute displayName="SSO Redirect" path="/sso-landing" key="sso-landing" component={<SSORedirect stripes={stripes} />} />
                        <TitledRoute displayName="Settings" path="/settings" component={<Settings stripes={stripes} />} />
                        {getModuleRoutes(stripes)}
                        <TitledRoute
                          displayName="Not Found"
                          component={(
                            <div>
                              <h2>Uh-oh!</h2>
                              <p>This route does not exist.</p>
                            </div>
                          )}
                        />
                      </Switch>
                    </ModuleContainer>
                  )}
                </MainContainer> :
                <Switch>
                  <TitledRoute displayName="SSO Landing" exact path="/sso-landing" component={<CookiesProvider><SSOLanding stripes={stripes} /></CookiesProvider>} key="sso-landing" />
                  <TitledRoute displayName="Log in" component={<LoginCtrl autoLogin={stripes.config.autoLogin} stripes={stripes} />} />
                </Switch>
              }
            </Router>
          </Provider>
        </HotKeys>
      </TitleManager>
    </StripesContext.Provider>
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
