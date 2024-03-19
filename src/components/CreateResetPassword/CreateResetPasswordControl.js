import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect as reduxConnect } from 'react-redux';

import processBadResponse from '../../processBadResponse';
import { stripesShape } from '../../Stripes';
import { setAuthError } from '../../okapiActions';
import { defaultErrors } from '../../constants';
import OrganizationLogo from '../OrganizationLogo';
import { getLocationQuery } from '../../locationService';

import CreateResetPassword from './CreateResetPassword';
import PasswordHasNotChanged from './components/PasswordHasNotChanged';
import PasswordSuccessfullyChanged from './components/PasswordSuccessfullyChanged';
import { getTenant } from './utils';

class CreateResetPasswordControl extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    location: PropTypes.shape({
      query: PropTypes.string,
      search: PropTypes.string.isRequired,
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        token: PropTypes.string,
      }),
    }),
    stripes: stripesShape.isRequired,
    handleBadResponse: PropTypes.func.isRequired,
    clearAuthErrors: PropTypes.func.isRequired,
    setDefaultAuthError: PropTypes.func.isRequired,
  };

  static defaultProps = {
    authFailure: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      isSuccessfulPasswordChange: false,
      submitIsFailed: false,
      isValidToken: false,
      isLoading: true,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    await this.makeCall();

    this.setState({ isLoading: false });
  }

  componentWillUnmount() {
    this.props.clearAuthErrors();
    this._isMounted = false;
  }

  handleResponse = (response) => {
    const {
      handleBadResponse,
      setDefaultAuthError,
    } = this.props;
    const { isValidToken } = this.state;

    switch (response.status) {
      case 204:
        this.setState(
          isValidToken
            ? { isSuccessfulPasswordChange: true }
            : { isValidToken: true }
        );
        break;
      case 401:
        this.setState({
          submitIsFailed: true,
        });
        setDefaultAuthError(defaultErrors.INVALID_LINK_ERROR);
        break;
      case 500:
        throw new Error(response.status);
      default:
        this.setState({
          submitIsFailed: true,
        });
        handleBadResponse(response);
    }
  };

  makeCall = (body) => {
    const {
      stripes,
      location,
      match: {
        params: {
          token,
        },
      },
      handleBadResponse,
    } = this.props;
    const { isValidToken } = this.state;
    const {
      okapi: {
        url,
      },
    } = stripes;

    const resetToken = token ?? getLocationQuery(location)?.resetToken;
    const interfacePath = stripes.hasInterface('users-keycloak') ? 'users-keycloak' : 'bl-users';
    const path = `${url}/${interfacePath}/password-reset/${isValidToken ? 'reset' : 'validate'}`;

    fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-okapi-token': resetToken,
        'x-okapi-tenant': getTenant(stripes, location),
      },
      ...(body && { body: JSON.stringify(body) }),
    })
      .then((response) => {
        if (this._isMounted) {
          this.handleResponse(response);
        }
      })
      .catch(error => {
        handleBadResponse(error);
      });
  };

  handleSubmit = async (values) => {
    const { newPassword } = values;

    await this.makeCall({ newPassword });
  };

  clearErrorsAfterSubmit = (submissionCompleted) => {
    if (submissionCompleted) {
      this.setState({ submitIsFailed: false });
      this.props.clearAuthErrors();
    }
  };

  render() {
    const {
      authFailure,
      clearAuthErrors,
    } = this.props;

    const {
      isSuccessfulPasswordChange,
      submitIsFailed,
      isValidToken,
      isLoading,
    } = this.state;

    if (isSuccessfulPasswordChange) {
      return <PasswordSuccessfullyChanged />;
    }

    if (isLoading) {
      return (
        <div>
          <OrganizationLogo />
        </div>
      );
    }

    if (!isValidToken) {
      return <PasswordHasNotChanged errors={authFailure} />;
    }

    return (
      <CreateResetPassword
        errors={authFailure}
        stripes={this.props.stripes}
        onSubmit={this.handleSubmit}
        onPasswordInputFocus={this.clearErrorsAfterSubmit}
        submitIsFailed={submitIsFailed}
        clearAuthErrors={clearAuthErrors}
      />
    );
  }
}

const mapStateToProps = state => ({ authFailure: state.okapi.authFailure });
const mapDispatchToProps = dispatch => ({
  handleBadResponse: error => processBadResponse(dispatch, error),
  clearAuthErrors: () => dispatch(setAuthError([])),
  setDefaultAuthError: error => dispatch(setAuthError([error])),
});

export default withRouter(reduxConnect(mapStateToProps, mapDispatchToProps)(CreateResetPasswordControl));
