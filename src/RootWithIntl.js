import React from 'react';
import PropTypes from 'prop-types';
import {
  Router,
  Switch,
} from 'react-router-dom';

import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { intlShape } from 'react-intl';

import { HotKeys } from '@folio/stripes-components/lib/HotKeys';
import { connectFor } from '@folio/stripes-connect';

import getModuleRoutes from './moduleRoutes';
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
  OverlayContainer,
  CreateResetPassword,
  ForgotUserNameCtrl,
  CheckEmailStatusPage,
} from './components';
import { stripesShape } from './Stripes';
import { StripesContext } from './StripesContext';

class RootWithIntl extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    token: PropTypes.string,
    disableAuth: PropTypes.bool.isRequired,
    history: PropTypes.shape({}),
  };

  static defaultProps = {
    token: '',
    history: {},
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  constructor(props, context) {
    super(props);

    const { intl } = context;
    const connect = connectFor(
      '@folio/core',
      props.stripes.epics,
      props.stripes.logger,
    );

    this.stripes = props.stripes.clone({
      intl,
      connect,
    });
    this.connectedCreateResetPassword = this.stripes.connect(CreateResetPassword);
    this.connectedForgotUsernameForm = this.stripes.connect(ForgotUserNameCtrl);
  }

  render() {
    const {
      token,
      disableAuth,
      history,
    } = this.props;

    return (
      <StripesContext.Provider value={this.stripes}>
        <ModuleTranslator>
          <TitleManager>
            <HotKeys
              keyMap={this.stripes.bindings}
              noWrapper
            >
              <Provider store={this.stripes.store}>
                <Router history={history}>
                  { token || disableAuth ?
                    <MainContainer>
                      <OverlayContainer />
                      <MainNav stripes={this.stripes} />
                      <HandlerManager
                        event={events.LOGIN}
                        stripes={this.stripes}
                      />
                      { (this.stripes.okapi !== 'object' || this.stripes.discovery.isFinished) && (
                        <ModuleContainer id="content">
                          <Switch>
                            <TitledRoute
                              name="home"
                              path="/"
                              key="root"
                              exact
                              component={<Front stripes={this.stripes} />}
                            />
                            <TitledRoute
                              name="ssoRedirect"
                              path="/sso-landing"
                              key="sso-landing"
                              component={<SSORedirect stripes={this.stripes} />}
                            />
                            <TitledRoute
                              name="settings"
                              path="/settings"
                              component={<Settings stripes={this.stripes} />}
                            />
                            {getModuleRoutes(this.stripes)}
                            <TitledRoute
                              name="notFound"
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
                      <TitledRoute
                        name="CreateResetPassword"
                        path="/(Create|Reset)Password/:token"
                        component={<this.connectedCreateResetPassword stripes={this.stripes} />}
                      />
                      <TitledRoute
                        name="ssoLanding"
                        exact
                        path="/sso-landing"
                        component={<CookiesProvider><SSOLanding stripes={this.stripes} /></CookiesProvider>}
                        key="sso-landing"
                      />
                      <TitledRoute
                        name="Forgot username"
                        path="/forgot-username"
                        component={<this.connectedForgotUsernameForm />}
                      />
                      <TitledRoute
                        name="Check email"
                        path="/check-email"
                        component={<CheckEmailStatusPage />}
                      />
                      <TitledRoute
                        name="login"
                        component={
                          <Login
                            autoLogin={this.stripes.config.autoLogin}
                            stripes={this.stripes}
                          />
                        }
                      />
                    </Switch>
                  }
                </Router>
              </Provider>
            </HotKeys>
          </TitleManager>
        </ModuleTranslator>
      </StripesContext.Provider>
    );
  }
}

export default RootWithIntl;
