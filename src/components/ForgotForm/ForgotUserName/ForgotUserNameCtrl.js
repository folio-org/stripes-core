import React, { Component } from 'react';
import {
  withRouter
} from 'react-router-dom';
import PropTypes from 'prop-types';

import ForgotUserNameForm from './ForgotUserName';
import validateEmail from '../helpers/validateEmail';

class ForgotUserNameCtrl extends Component {
  static propTypes = {
    mutator: PropTypes.shape({
      searchUsername: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    history: PropTypes.object,
  };

  // Expect any MIME type to receive because of the empty body
  // and no Content-Type header in response
  static manifest = Object.freeze({
    searchUsername: {
      type: 'okapi',
      path: 'bl-users/forgotten/username',
      headers: {
        'accept': '*/*',
      },
      fetch: false,
      throwErrors: false,
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      isValidEmail: true,
      userExist: true
    };
  }

  render() {
    return (
      <ForgotUserNameForm
        onSubmit={this.handleSubmit}
        isValid={this.state.isValidEmail}
        userExists={this.state.userExist}
      />
    );
  }

  handleSubmit = values => {
    this.resetState();
    const {
      mutator: { searchUsername },
    } = this.props;
    const { userInput } = values;
    const isValidInput = validateEmail(userInput);

    return isValidInput
      ? searchUsername
        .POST({ id: userInput })
        .then(() => this.handleSuccessfulResponse())
        .catch(() => this.handleBadResponse())
      : this.setState(() => ({ isValidEmail: false }));

    //     id: 'hillard@roob-glover.am'
  };

  handleSuccessfulResponse = () => {
    this.props.history.push('/check-email');
  };

  handleBadResponse = () => {
    this.setState(() => ({ userExist: false }));
  };

  resetState = () => {
    this.setState(() => ({ isValidEmail: true, userExist: true }));
  };
}

export default withRouter(ForgotUserNameCtrl);
