import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect as reduxConnect } from 'react-redux';

import CreateResetPassword from './CreateResetPassword';
import processBadResponse from '../../processBadResponse';

class CreateResetPasswordControl extends Component {
  // don't have back end yet, should be changed
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
    stripes: PropTypes.shape({
      intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static defaultProps = {
    authFailure: []
  };

  handleSuccessfulResponse() {
    // need to discuss, should be implemented
  }

  // should be changed
  handleSubmit = values => {
    const {
      mutator: { changePassword },
      stripes: { store }
    } = this.props;
    const { newPassword } = values;

    return changePassword
      .POST({ password: newPassword })
      .then(() => { this.handleSuccessfulResponse(); })
      .catch((response) => { processBadResponse(store, response); });
  };

  render() {
    const { authFailure } = this.props;

    return (
      <CreateResetPassword
        onSubmit={this.handleSubmit}
        errors={authFailure}
        stripes={this.props.stripes}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    authFailure: state.okapi.authFailure,
  };
}

export default reduxConnect(mapStateToProps)(CreateResetPasswordControl);
