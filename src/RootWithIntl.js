import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Router,
  Switch,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';

import { connectFor } from '@folio/stripes-connect';
import { Callout, HotKeys } from '@folio/stripes-components';

import ModuleRoutes from './ModuleRoutes';
import events from './events';

import {
  MainContainer,
  MainNav,
  ModuleContainer,
  ModuleTranslator,
  TitledRoute,
  Front,
  SSOLanding,
  SSORedirect,
  Settings,
  HandlerManager,
  TitleManager,
  Login,
  Logout,
  LogoutTimeout,
  OverlayContainer,
  CreateResetPassword,
  CheckEmailStatusPage,
  ForgotPasswordCtrl,
  ForgotUserNameCtrl,
  AppCtxMenuProvider,
  SessionEventContainer,
} from './components';
import StaleBundleWarning from './components/StaleBundleWarning';
import { StripesContext } from './StripesContext';
import { CalloutContext } from './CalloutContext';

const RootWithIntl = ({ stripes, token = '', isAuthenticated = false, disableAuth, history = {}, queryClient }) => {
  const connect = connectFor('@folio/core', stripes.epics, stripes.logger);
  const connectedStripes = stripes.clone({ connect });

  const [callout, setCallout] = useState(null);
  const setCalloutDomRef = (ref) => {
    setCallout(ref);
  };

  return (
    <StripesContext.Provider value={connectedStripes}>
      <CalloutContext.Provider value={callout}>
        <ModuleTranslator>
          <TitleManager>
            <HotKeys
              keyMap={connectedStripes.bindings}
              noWrapper
            >
              <Provider store={connectedStripes.store}>
                <Router history={history}>
                  { isAuthenticated || token || disableAuth ?
                    <>
                      <MainContainer>
                        <AppCtxMenuProvider>
                          <MainNav stripes={connectedStripes} queryClient={queryClient} />
                          {typeof connectedStripes?.config?.staleBundleWarning === 'object' && <StaleBundleWarning />}
                          <HandlerManager
                            event={events.LOGIN}
                            stripes={connectedStripes}
                          />
                          { (typeof connectedStripes.okapi !== 'object' || connectedStripes.discovery.isFinished) && (
                            <ModuleContainer id="content">
                              <OverlayContainer />
                              {connectedStripes.config.useSecureTokens && <SessionEventContainer history={history} queryClient={queryClient} />}
                              <Switch>
                                <TitledRoute
                                  name="home"
                                  path="/"
                                  key="root"
                                  exact
                                  component={<Front stripes={connectedStripes} />}
                                />
                                <TitledRoute
                                  name="ssoRedirect"
                                  path="/sso-landing"
                                  key="sso-landing"
                                  component={<SSORedirect stripes={connectedStripes} />}
                                />
                                <TitledRoute
                                  name="logoutTimeout"
                                  path="/logout-timeout"
                                  component={<LogoutTimeout />}
                                />
                                <TitledRoute
                                  name="settings"
                                  path="/settings"
                                  component={<Settings stripes={connectedStripes} />}
                                />
                                <TitledRoute
                                  name="logout"
                                  path="/logout"
                                  component={<Logout history={history} />}
                                />
                                <ModuleRoutes stripes={connectedStripes} />
                              </Switch>
                            </ModuleContainer>
                          )}
                        </AppCtxMenuProvider>
                      </MainContainer>
                      <Callout ref={setCalloutDomRef} />
                    </> :
                    <Switch>
                      {/* The ? after :token makes that part of the path optional, so that token may optionally
                      be passed in via URL parameter to avoid length restrictions */}
                      <TitledRoute
                        name="CreateResetPassword"
                        path="/reset-password/:token?"
                        component={<CreateResetPassword stripes={connectedStripes} />}
                      />
                      <TitledRoute
                        name="ssoLanding"
                        exact
                        path="/sso-landing"
                        component={<CookiesProvider><SSOLanding stripes={connectedStripes} /></CookiesProvider>}
                        key="sso-landing"
                      />
                      <TitledRoute
                        name="forgotPassword"
                        path="/forgot-password"
                        component={<ForgotPasswordCtrl stripes={connectedStripes} />}
                      />
                      <TitledRoute
                        name="forgotUsername"
                        path="/forgot-username"
                        component={<ForgotUserNameCtrl stripes={connectedStripes} />}
                      />
                      <TitledRoute
                        name="checkEmail"
                        path="/check-email"
                        component={<CheckEmailStatusPage />}
                      />
                      <TitledRoute
                        name="logoutTimeout"
                        path="/logout-timeout"
                        component={<LogoutTimeout />}
                      />
                      <TitledRoute
                        name="login"
                        component={
                          <Login
                            autoLogin={connectedStripes.config.autoLogin}
                            stripes={connectedStripes}
                          />}
                      />
                    </Switch>
                  }
                </Router>
              </Provider>
            </HotKeys>
          </TitleManager>
        </ModuleTranslator>
      </CalloutContext.Provider>
    </StripesContext.Provider>
  );
};

RootWithIntl.propTypes = {
  stripes: PropTypes.shape({
    clone: PropTypes.func.isRequired,
    config: PropTypes.object,
    epics: PropTypes.object,
    logger: PropTypes.object.isRequired,
    okapi: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  }).isRequired,
  token: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  disableAuth: PropTypes.bool.isRequired,
  history: PropTypes.shape({}),
  queryClient: PropTypes.object.isRequired,
};

export default RootWithIntl;

