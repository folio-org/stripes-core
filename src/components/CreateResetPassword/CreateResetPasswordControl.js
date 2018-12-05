import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect as reduxConnect } from 'react-redux';

import processBadResponse from '../../processBadResponse';
import { stripesShape } from '../../Stripes';

import CreateResetPassword from './CreateResetPassword';
import PasswordSuccessfullyChanged from './components/PasswordSuccessfullyChanged';

class CreateResetPasswordControl extends Component {
  static manifest = Object.freeze({
    changePassword: {
      type: 'okapi',
      path: 'bl-users/login',
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
      }).isRequired,
    }).isRequired,
    stripes: stripesShape.isRequired,
  };

  static defaultProps = {
    authFailure: [],
  };

  state = {
    isSuccessfulPasswordChange: false,
  };

  handleSuccessfulResponse = () => {
    this.setState({ isSuccessfulPasswordChange: true });
  };

  handleSubmit = values => {
    const {
      mutator: { changePassword },
      stripes: { store },
    } = this.props;
    const { newPassword } = values;

    return changePassword
      .POST({ password: newPassword })
      .then(() => { this.handleSuccessfulResponse(); })
      .catch((response) => { processBadResponse(store, response); });
  };

  render() {
    const {
      authFailure,
      match: {
        params: {
          token,
        }
      }
    } = this.props;

    const { isSuccessfulPasswordChange } = this.state;

    if (isSuccessfulPasswordChange) {
      return <PasswordSuccessfullyChanged />;
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

export default reduxConnect(mapStateToProps)(CreateResetPasswordControl);
