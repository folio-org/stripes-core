import React, { Component } from 'react';
import {
  withRouter,
  Redirect,
} from 'react-router-dom';
import { connect as reduxConnect } from 'react-redux';
import PropTypes from 'prop-types';

import { validateForgotUsernameForm } from '../../validators';
import processBadResponse from '../../processBadResponse';
import { setAuthError } from '../../okapiActions';
import { defaultErrors } from '../../constants';

import ForgotUserNameForm from './ForgotUserNameForm';

class ForgotUserNameCtrl extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    mutator: PropTypes.shape({
      searchUsername: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    handleBadResponse: PropTypes.func.isRequired,
    clearAuthErrors: PropTypes.func.isRequired,
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

  constructor(props) {
    super(props);

    this.state = {
      isValidEmail: true,
      userExists: false,
      userEmail: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.clearAuthErrors();
  }

  async handleSubmit(values) {
    this.resetState();
    const {
      mutator: {
        searchUsername,
      },
      handleBadResponse,
    } = this.props;
    const { userInput } = values;
    const { FORGOTTEN_USERNAME_CLIENT_ERROR } = defaultErrors;
    const isValidInput = validateForgotUsernameForm(userInput);

    if (isValidInput) {
      try {
        await searchUsername.POST({ id: userInput });

        this.handleSuccessfulResponse(userInput);
      } catch (error) {
        handleBadResponse(error, FORGOTTEN_USERNAME_CLIENT_ERROR);
      }
    } else {
      this.setState({ isValidEmail: false });
    }
  }

  handleSuccessfulResponse = (userEmail) => {
    this.setState({
      userExists: true,
      userEmail,
    });
  };

  resetState = () => {
    this.setState({
      isValidEmail: true,
      userExists: false,
    });
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
const mapDispatchToProps = dispatch => ({
  handleBadResponse: (error, defaultClientError) => processBadResponse(dispatch, error, defaultClientError),
  clearAuthErrors: () => dispatch(setAuthError([])),
});

export default withRouter(reduxConnect(mapStateToProps, mapDispatchToProps)(ForgotUserNameCtrl));
