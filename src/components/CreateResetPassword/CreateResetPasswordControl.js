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

class CreateResetPasswordControl extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    match: PropTypes.shape({
      params: PropTypes.shape({
        token: PropTypes.string.isRequired,
        resetPasswordActionId: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    location: PropTypes.shape({
      state: PropTypes.shape({
        isValidToken: PropTypes.bool.isRequired,
        errorCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
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
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAuthErrors();
  }

  handleResponse = (response) => {
    const {
      handleBadResponse,
      setDefaultAuthError,
    } = this.props;

    switch (response.status) {
      case 204:
        this.handleSuccessfulResponse();
        break;
      case 401:
        this.setState({ submitIsFailed: true });
        setDefaultAuthError([defaultErrors.INVALID_LINK_ERROR]);
        break;
      default:
        this.setState({ submitIsFailed: true });
        handleBadResponse(response);
    }
  };

  handleSuccessfulResponse = () => {
    this.setState({ isSuccessfulPasswordChange: true });
  };

  async handleSubmit(values) {
    const {
      stripes: {
        okapi: {
          url,
          tenant,
        }
      },
      match: {
        params: {
          resetPasswordActionId,
          token,
        },
      },
      handleBadResponse,
    } = this.props;
    const { newPassword } = values;

    try {
      const response = await fetch(`${url}/bl-users/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-okapi-token': token,
          'x-okapi-tenant': tenant,
        },
        body: JSON.stringify({
          newPassword,
          resetPasswordActionId,
        }),
      });

      this.handleResponse(response);
    } catch (error) {
      handleBadResponse(error);
    }
  }

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
      location: {
        state: {
          isValidToken,
          errorCodes,
        },
      },
    } = this.props;

    const {
      isSuccessfulPasswordChange,
      submitIsFailed,
    } = this.state;

    if (isSuccessfulPasswordChange) {
      return <PasswordSuccessfullyChanged />;
    }

    if (!isValidToken) {
      return <PasswordHasNotChanged errors={errorCodes} />;
    }

    return (
      <CreateResetPassword
        token={token}
        errors={authFailure}
        stripes={this.props.stripes}
        onSubmit={this.handleSubmit}
        onPasswordInputFocus={this.clearErrorsAfterSubmit}
        submitIsFailed={submitIsFailed}
      />
    );
  }
}

const mapStateToProps = state => ({ authFailure: state.okapi.authFailure });
const mapDispatchToProps = dispatch => ({
  handleBadResponse: error => processBadResponse(dispatch, error),
  clearAuthErrors: () => dispatch(setAuthError([])),
  setDefaultAuthError: error => dispatch(setAuthError(error)),
});

export default withRouter(reduxConnect(mapStateToProps, mapDispatchToProps)(CreateResetPasswordControl));
