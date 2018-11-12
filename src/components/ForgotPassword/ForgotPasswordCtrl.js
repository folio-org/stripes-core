import React, { Component } from 'react';
import {
  withRouter,
  Redirect,
} from 'react-router-dom';
import PropTypes from 'prop-types';

import ForgotPasswordForm from './ForgotPasswordForm';
import { validateForgotUsernameForm } from '../../validators';

class ForgotPassword extends Component {
  static propTypes = {
    mutator: PropTypes.shape({
      searchUsername: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  // Expect any MIME type to receive because of the empty body
  // and no Content-Type header in response
  static manifest = Object.freeze({
    searchUsername: {
      type: 'okapi',
      path: 'bl-users/forgotten/password',
      headers: {
        'accept': '*/*',
      },
      fetch: false,
      throwErrors: false,
    },
  });

  state = {
    isValidEmail: false,
    userExists: false,
    hasErrorsContainer: false,
    userEmail: '',
  };


  handleSubmit = values => {
    this.resetState();
    const {
      mutator: {
        searchUsername,
      },
    } = this.props;
    const { userInput } = values;
    const isValidInput = validateForgotUsernameForm(userInput);

    return isValidInput
      ? searchUsername
        .POST({ id: userInput })
        .then(() => this.handleSuccessfulResponse(userInput))
        .catch(this.handleBadResponse)
      : this.setState({
        isValidEmail: false,
        hasErrorsContainer: true,
      });
  };

  handleSuccessfulResponse = (userEmail) => {
    this.setState({
      userExists: true,
      userEmail,
    });
  };

  handleBadResponse = () => {
    this.setState({
      userExists: false,
      hasErrorsContainer: true,
    });
  };

  resetState = () => {
    this.setState({
      isValidEmail: true,
      userExists: false,
      hasErrorsContainer: false,
    });
  };

  render() {
    const {
      userExists,
      isValidEmail,
      hasErrorsContainer,
      userEmail,
    } = this.state;

    if (userExists) {
      return <Redirect to={{
        pathname: '/check-email',
        state: { userEmail },
      }}
      />;
    }

    return (
      <ForgotPasswordForm
        isValid={isValidEmail}
        hasErrorsContainer={hasErrorsContainer}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

export default withRouter(ForgotPassword);
