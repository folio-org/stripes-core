import React, { Component } from 'react';
import {
  withRouter,
  Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import CreateResetPasswordLoader from './CreateResetPasswordLoader';
import { changePasswordErrorCodes } from '../../constants/changePasswordErrorCodes';

class CreateResetPasswordLoaderCtrl extends Component {
  static manifest = Object.freeze({
    checkTokenIsValid: {
      type: 'okapi',
      path: 'bl-users/password-reset/validate',
      fetch: false,
      throwErrors: false,
    },
  });

  static propTypes = {
    mutator: PropTypes.shape({
      checkTokenIsValid: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        token: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  state = {
    isLoaded: false,
    isValidToken: false,
    errorCodes: [],
    actionId: 0,
  };

  componentDidMount() {
    const {
      mutator: {
        checkTokenIsValid,
      },
      match: {
        params: {
          token,
        },
      },
    } = this.props;

    checkTokenIsValid
      .POST({ 'x-okapi-token': token })
      .then((res) => this.handleSuccessfulResponse(res))
      .catch((err) => this.handleBadResponse(err));
  }

  completeLoading() {
    this.setState({ isLoaded: true });
  }

  handleSuccessfulResponse(res) {
    this.setState({
      isValidToken: true,
      actionId: res.resetPasswordActionId,
    });
    this.completeLoading();
  }

  handleBadResponse(res) {
    const invalidLinkErrorCode = changePasswordErrorCodes.invalidErrorCode;

    this.setState({
      isValidToken: false,
      errorCodes: res.status === 422
        ? res.errors.map(err => err.code)
        : [invalidLinkErrorCode],
    });
    this.completeLoading();
  }

  render() {
    const {
      isLoaded,
      isValidToken,
      errorCodes,
      actionId,
    } = this.state;

    if (isLoaded) {
      const {
        match: {
          params: {
            token,
          },
        },
      } = this.props;

      return (
        <Redirect
          to={{
            pathname: `/create-password/${token}/${actionId}`,
            state: {
              isValidToken,
              errorCodes,
            },
          }}
          push
        />
      );
    }

    return (
      <CreateResetPasswordLoader />
    );
  }
}

export default withRouter(CreateResetPasswordLoaderCtrl);
