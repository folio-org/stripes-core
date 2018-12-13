import React, { Component } from 'react';
import {
  withRouter,
  Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import { isArray } from 'lodash';

import CreateResetPasswordLoader from './CreateResetPasswordLoader';
import {
  defaultErrorCodes,
} from '../../constants';
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

  async componentDidMount() {
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

    try {
      const response = await fetch(`${url}/bl-users/password-reset/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-okapi-token': token,
          'x-okapi-tenant': tenant,
        },
      });

      await this.handleResponse(response);
    } catch (error) {
      const defaultServerErrorCode = defaultErrorCodes.DEFAULT_SERVER_ERROR;

      this.handleDefaultLinkError(defaultServerErrorCode);
    }
  }

  setInvalidLinkErrorCodes = (errors) => {
    this.setState({
      isValidToken: false,
      errorCodes: errors.map(err => err.code),
      isLoaded: true,
    });
  };

  setTokenIsValid = (payload) => {
    this.setState({
      isValidToken: true,
      actionId: payload.resetPasswordActionId,
      isLoaded: true,
    });
  };

  handleDefaultLinkError = (errorCode) => {
    this.setState({
      isValidToken: false,
      errorCodes: [errorCode],
      isLoaded: true,
    });
  };

  handleInvalidLinkError = (parsedResponse) => {
    const { errors } = parsedResponse;
    const isValidResponseBody = isArray(errors);

    if (isValidResponseBody) {
      this.setInvalidLinkErrorCodes(errors);
    } else {
      const defaultServerErrorCode = defaultErrorCodes.DEFAULT_SERVER_ERROR;

      this.handleDefaultLinkError(defaultServerErrorCode);
    }
  };

  async handleResponse(response) {
    let parsedResponse;
    const defaultServerErrorCode = defaultErrorCodes.DEFAULT_SERVER_ERROR;

    try {
      parsedResponse = await response.json();

      switch (response.status) {
        case 200:
          this.setTokenIsValid(parsedResponse);
          break;
        case 422:
          this.handleInvalidLinkError(parsedResponse);
          break;
        default:
          this.handleDefaultLinkError(defaultServerErrorCode);
      }
    } catch (e) {
      this.handleDefaultLinkError(defaultServerErrorCode);
    }
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
