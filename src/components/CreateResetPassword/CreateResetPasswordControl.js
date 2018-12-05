import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { connect as reduxConnect } from 'react-redux';

import processBadResponse from '../../processBadResponse';
import { stripesShape } from '../../Stripes';

import CreateResetPassword from './CreateResetPassword';
import ChangePasswordError from './components/ChangePasswordError';
import ChangePasswordConfirmation from './components/ChangePasswordConfirmation';

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
  };

  static defaultProps = {
    authFailure: [],
  };

  state = {
    isSuccessfulPasswordChange: false
  };

  handleSuccessfulResponse = () => {
    // Todo: UIU-748
    this.setState({ isSuccessfulPasswordChange: true });
  };

  handleSubmit = values => {
    const {
      mutator: { changePassword },
      match: {
        params: {
          resetPasswordId,
        },
      },
      stripes: { store },
    } = this.props;
    const { newPassword } = values;

    return changePassword
      .POST({
        newPassword,
        resetPasswordId,
      })
      .then(this.handleSuccessfulResponse)
      .catch((response) => { processBadResponse(store, response); });
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

    const { isSuccessfulPasswordChange } = this.state;

    if (isSuccessfulPasswordChange) {
      return <ChangePasswordConfirmation />;
    }

    if (!isValidToken) {
      return <ChangePasswordError errors={errorCodes} />;
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

const mapStateToProps = (state) => ({ authFailure: state.okapi.authFailure });

export default withRouter(reduxConnect(mapStateToProps)(CreateResetPasswordControl));
