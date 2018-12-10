import React, { Component } from 'react';
import {
  withRouter,
  Redirect,
} from 'react-router-dom';
import { connect as reduxConnect } from 'react-redux';
import PropTypes from 'prop-types';

import { validateForgotUsernameForm } from '../../validators';
import processBadResponse from '../../processBadResponse';
import { stripesShape } from '../../Stripes';
import ForgotUserNameForm from './ForgotUserNameForm';

class ForgotUserNameCtrl extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    mutator: PropTypes.shape({
      searchUsername: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    stripes: stripesShape.isRequired,
  };

    static defaultProps = {
      authFailure: []
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

  state = {
    isValidEmail: true,
    userExists: false,
    userEmail: '',
  };

    handleSubmit = values => {
      this.resetState();
      const {
        mutator: {
          searchUsername,
        },
        stripes: {
          store,
        },
      } = this.props;
      const { userInput } = values;
      const isValidInput = validateForgotUsernameForm(userInput);

      return isValidInput
        ? searchUsername
          .POST({ id: userInput })
          .then(() => this.handleSuccessfulResponse(userInput))
          .catch(response => { processBadResponse(store, response); })
        : this.setState({
          isValidEmail: false,
        });
    };

  handleSuccessfulResponse = (userEmail) => {
    this.setState({
      userExists: true,
      userEmail,
    });
  };

  resetState = () => {
    this.setState(
      {
        isValidEmail: true,
        userExists: false,
      }
    );
  };

  render() {
    const { authFailure } = this.props;
    const {
      userExists,
      isValidEmail,
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
      <ForgotUserNameForm
        isValid={isValidEmail}
        errors={authFailure}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

const mapStateToProps = state => ({ authFailure: state.okapi.authFailure });

export default withRouter(reduxConnect(mapStateToProps)(ForgotUserNameCtrl));
