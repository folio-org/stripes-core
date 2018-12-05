import React, { Component } from 'react';
import {
  withRouter,
  Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import CreateResetPasswordLoader from './CreateResetPasswordLoader';
import { changePasswordErrorCodes } from '../../constants/changePasswordErrorCodes';
import { stripesShape } from '../../Stripes';

class CreateResetPasswordLoaderCtrl extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        token: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    stripes: stripesShape.isRequired,
  };

  state = {
    isLoaded: false,
    isValidToken: false,
    errorCodes: [],
    actionId: 0,
  };

  componentDidMount() {
    const {
      match: {
        params: {
          token,
        },
      },
      stripes: {
        okapi: {
          url,
          tenant,
        },
      },
    } = this.props;

    fetch(`${url}/bl-users/password-reset/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-okapi-token': token,
        'x-okapi-tenant': tenant,
      },
    })
      .then(res => this.handleResponse(res))
      .catch(err => this.handleBadResponse(err));
  }

  completeLoading = () => {
    this.setState({ isLoaded: true });
  };

  handleDefaultLinkError = () => {
    const invalidLinkErrorCode = changePasswordErrorCodes.INVALID_ERROR_CODE;

    this.setState({
      isValidToken: false,
      errorCodes: [invalidLinkErrorCode],
    });
    this.completeLoading();
  };

  handleInvalidLinkError = (response) => {
    response.json()
      .then(res => {
        const { errors } = res;

        this.setState({
          isValidToken: false,
          errorCodes: errors.map(err => err.code),
        });
        this.completeLoading();
      });
  };

  handleResponse = (response) => {
    if (response.status === 200) {
      response.json()
        .then(res => {
          const { resetPasswordActionId } = res;

          this.setState({
            isValidToken: true,
            actionId: resetPasswordActionId,
          });
          this.completeLoading();
        });
    } else {
      this.handleBadResponse(response);
    }
  };

  handleBadResponse = (response) => {
    if (response.status === 422) {
      this.handleInvalidLinkError(response);
    } else {
      this.handleDefaultLinkError();
    }
  };

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
