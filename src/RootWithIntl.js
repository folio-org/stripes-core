import React from 'react';
import PropTypes from 'prop-types';
import {
  Router,
  Switch,
  Redirect as InternalRedirect
} from 'react-router-dom';

import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';

import { connectFor } from '@folio/stripes-connect';
import { Callout, HotKeys } from '@folio/stripes-components';

import ModuleRoutes from './moduleRoutes';
import events from './events';

import {
  MainContainer,
  MainNav,
  ModuleContainer,
  ModuleTranslator,
  TitledRoute,
  Front,
  OIDCRedirect,
  OIDCLanding,
  SSOLanding,
  SSORedirect,
  Settings,
  HandlerManager,
  TitleManager,
  Login,
  OverlayContainer,
  CreateResetPassword,
  CheckEmailStatusPage,
  ForgotPasswordCtrl,
  ForgotUserNameCtrl,
  AppCtxMenuProvider,
} from './components';
import StaleBundleWarning from './components/StaleBundleWarning';
import { StripesContext } from './StripesContext';
import { CalloutContext } from './CalloutContext';
import AuthnLogin from './components/AuthnLogin';

export const renderLogoutComponent = () => {
  return <InternalRedirect to="/" />;
};

class RootWithIntl extends React.Component {
  static propTypes = {
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
  };

  static defaultProps = {
    token: '',
    isAuthenticated: false,
    history: {},
  };

  state = { callout: null };

  setCalloutRef = (ref) => {
    this.setState({
      callout: ref,
    });
  }

  render() {
    const {
      token,
      isAuthenticated,
      disableAuth,
      history,
    } = this.props;

    const connect = connectFor('@folio/core', this.props.stripes.epics, this.props.stripes.logger);
    const stripes = this.props.stripes.clone({ connect });

    return (
      <StripesContext.Provider value={stripes}>
        <CalloutContext.Provider value={this.state.callout}>
          <ModuleTranslator>
            <TitleManager>
              <HotKeys
                keyMap={stripes.bindings}
                noWrapper
              >
                <Provider store={stripes.store}>
                  <Router history={history}>
                    { isAuthenticated || token || disableAuth ?
                      <>
                        <MainContainer>
                          <AppCtxMenuProvider>
                            <MainNav stripes={stripes} />
                            {typeof stripes?.config?.staleBundleWarning === 'object' && <StaleBundleWarning />}
                            <HandlerManager
                              event={events.LOGIN}
                              stripes={stripes}
                            />
                            { (stripes.okapi !== 'object' || stripes.discovery.isFinished) && (
                              <ModuleContainer id="content">
                                <OverlayContainer />
                                <Switch>
                                  <TitledRoute
                                    name="home"
                                    path="/"
                                    key="root"
                                    exact
                                    component={<Front stripes={stripes} />}
                                  />
                                  <TitledRoute
                                    name="ssoRedirect"
                                    path="/sso-landing"
                                    key="sso-landing"
                                    component={<SSORedirect stripes={stripes} />}
                                  />
                                  <TitledRoute
                                    name="oidcRedirect"
                                    path="/oidc-landing"
                                    key="oidc-landing"
                                    component={<OIDCRedirect stripes={stripes} />}
                                  />
                                  <TitledRoute
                                    name="settings"
                                    path="/settings"
                                    component={<Settings stripes={stripes} />}
                                  />
                                  <ModuleRoutes stripes={stripes} />
                                </Switch>
                              </ModuleContainer>
                            )}
                          </AppCtxMenuProvider>
                        </MainContainer>
                        <Callout ref={this.setCalloutRef} />
                      </> :
                      <Switch>
                        <TitledRoute
                          name="CreateResetPassword"
                          path="/reset-password/:token"
                          component={<CreateResetPassword stripes={stripes} />}
                        />
                        <TitledRoute
                          name="ssoLanding"
                          exact
                          path="/sso-landing"
                          component={<CookiesProvider><SSOLanding stripes={stripes} /></CookiesProvider>}
                          key="sso-landing"
                        />
                        <TitledRoute
                          name="oidcLanding"
                          exact
                          path="/oidc-landing"
                          component={<CookiesProvider><OIDCLanding stripes={stripes} /></CookiesProvider>}
                          key="oidc-landing"
                        />
                        <TitledRoute
                          name="forgotPassword"
                          path="/forgot-password"
                          component={<ForgotPasswordCtrl stripes={stripes} />}
                        />
                        <TitledRoute
                          name="forgotUsername"
                          path="/forgot-username"
                          component={<ForgotUserNameCtrl stripes={stripes} />}
                        />
                        <TitledRoute
                          name="checkEmail"
                          path="/check-email"
                          component={<CheckEmailStatusPage />}
                        />
                        <TitledRoute
                          name="logout"
                          path="/logout"
                          component={renderLogoutComponent()}
                        />
                        <TitledRoute
                          name="login"
                          component={<AuthnLogin stripes={this.props.stripes} />}
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
  }
}

export default RootWithIntl;
