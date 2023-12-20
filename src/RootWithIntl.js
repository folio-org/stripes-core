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
import Redirect from './components/Redirect';

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
import PreLoginLanding from './components/PreLoginLanding';
import { setOkapiTenant } from './okapiActions';

class RootWithIntl extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      config: PropTypes.object,
      epics: PropTypes.object,
      logger: PropTypes.object.isRequired,
      clone: PropTypes.func.isRequired,
      config: PropTypes.object.isRequired,
      okapi: PropTypes.object.isRequired,
      store: PropTypes.object.isRequired
    }).isRequired,
    token: PropTypes.string,
    disableAuth: PropTypes.bool.isRequired,
    history: PropTypes.shape({}),
  };

  static defaultProps = {
    token: '',
    history: {},
  };

  state = { callout: null };

  handleSelectTenant = (tenant, clientId) => {
    localStorage.setItem('tenant', JSON.stringify({ tenantName: tenant, clientId }));
    this.props.stripes.store.dispatch(setOkapiTenant({ clientId, tenant }));
  }

  setCalloutRef = (ref) => {
    this.setState({
      callout: ref,
    });
  }

  singleTenantAuthnUrl = () => {
    const { okapi } = this.props.stripes;
    const redirectUri = `${window.location.protocol}//${window.location.host}/oidc-landing`;

    return `${okapi.authnUrl}/realms/${okapi.tenant}/protocol/openid-connect/auth?client_id=${okapi.clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid`;
  }

  renderLogoutComponent() {
    const { okapi } = this.props.stripes;

    if (okapi.authnUrl) {
      return <Redirect to={`${okapi.authnUrl}/realms/${okapi.tenant}/protocol/openid-connect/logout?client_id=${okapi.clientId}&post_logout_redirect_uri=${window.location.protocol}//${window.location.host}`} />;
    }

    return <InternalRedirect to="/" />;
  }

  renderLoginComponent() {
    const { config, okapi } = this.props.stripes;

    if (okapi.authnUrl) {
      if (config.isSingleTenant) {
        return <Redirect to={this.singleTenantAuthnUrl()} />;
      }
      return <PreLoginLanding
        onSelectTenant={this.handleSelectTenant}
      />;
    }

    return <Login
      autoLogin={config.autoLogin}
      stripes={this.props.stripes}
    />;
  }

  render() {
    const {
      token,
      disableAuth,
      history,
    } = this.props;

    const connect = connectFor('@folio/core', this.props.stripes.epics, this.props.stripes.logger);
    const stripes = this.props.stripes.clone({ connect });

    const LoginComponent = stripes.okapi.authnUrl ?
      <PreLoginLanding
        onSelectTenant={this.handleSelectTenant}
      />
      :
      <Login
        autoLogin={stripes.config.autoLogin}
        stripes={stripes}
      />;

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
                    { token || disableAuth ?
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
                          component={this.renderLogoutComponent()}
                        />
                        <TitledRoute
                          name="login"
                          component={this.renderLoginComponent()}
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
