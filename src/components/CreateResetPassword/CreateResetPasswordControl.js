import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect as reduxConnect } from 'react-redux';

import processBadResponse from '../../processBadResponse';
import { stripesShape } from '../../Stripes';
import { setAuthError } from '../../okapiActions';

import CreateResetPassword from './CreateResetPassword';
import PasswordHasNotChanged from './components/PasswordHasNotChanged';
import PasswordSuccessfullyChanged from './components/PasswordSuccessfullyChanged';

class CreateResetPasswordControl extends Component {
  static manifest = Object.freeze({
    changePassword: {
      type: 'okapi',
      path: 'bl-users/password-reset/reset',
      fetch: false,
      throwErrors: false,
    },
  });

  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    mutator: PropTypes.shape({
      changePassword: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
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
  };

  static defaultProps = {
    authFailure: [],
  };

  constructor(props) {
    super(props);

    this.state = { isSuccessfulPasswordChange: false };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAuthErrors();
  }

  handleSuccessfulResponse = () => {
    this.setState({ isSuccessfulPasswordChange: true });
  };

  async handleSubmit(values) {
    const {
      mutator: { changePassword },
      match: {
        params: {
          resetPasswordId,
        },
      },
      handleBadResponse,
    } = this.props;
    const { newPassword } = values;

    try {
      await changePassword.POST({
        newPassword,
        resetPasswordId,
      });
      this.handleSuccessfulResponse();
    } catch (error) {
      handleBadResponse(error);
    }
  }

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

    const { isSuccessfulPasswordChange } = this.state;

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
      />
    );
  }
}

const mapStateToProps = state => ({ authFailure: state.okapi.authFailure });
const mapDispatchToProps = dispatch => ({
  handleBadResponse: error => processBadResponse(dispatch, error),
  clearAuthErrors: () => dispatch(setAuthError([])),
});

export default withRouter(reduxConnect(mapStateToProps, mapDispatchToProps)(CreateResetPasswordControl));
