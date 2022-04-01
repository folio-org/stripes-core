import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect as reduxConnect } from 'react-redux';

import processBadResponse from '../../processBadResponse';
import { stripesShape } from '../../Stripes';
import { setAuthError } from '../../okapiActions';
import { defaultErrors } from '../../constants';

import CreateResetPassword from './CreateResetPassword';
import PasswordHasNotChanged from './components/PasswordHasNotChanged';
import PasswordSuccessfullyChanged from './components/PasswordSuccessfullyChanged';
import OrganizationLogo from '../OrganizationLogo';

class CreateResetPasswordControl extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    match: PropTypes.shape({
      params: PropTypes.shape({
        token: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
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
      stripes: {
        okapi: {
          url,
          tenant,
        }
      },
      match: {
        params: {
          token,
        },
      },
      handleBadResponse,
    } = this.props;
    const { isValidToken } = this.state;

    const path = `${url}/bl-users/password-reset/${isValidToken ? 'reset' : 'validate'}`;

    fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-okapi-token': token,
        'x-okapi-tenant': tenant,
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
      match: {
        params: {
          token,
        },
      },
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
        token={token}
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
