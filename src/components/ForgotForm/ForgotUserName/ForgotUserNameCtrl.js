import React, { Component } from 'react';
import ForgotUserNameForm from './ForgotUserName';
import validateEmail from '../helpers/validateEmail';

const requestConfig = require('stripes-config');

class ForgotUserNameCtrl extends Component {
  constructor(props) {
    super(props);
    this.requestConfig = requestConfig;
    this.isValidEmail = false;
  }

  render() {
    return (
      <ForgotUserNameForm
        onSubmit={this.handleSubmit}
      />
    );
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.isValidEmail = validateEmail('anton_plotniko@epam.com');
    const okapiUrl = this.requestConfig.okapi.url;
    const okapiTenant = this.requestConfig.okapi.tenant;
    fetch(`${okapiUrl}/bl-users/forgotten/username`, {
      method: 'POST',
      headers: { 'X-Okapi-Tenant': okapiTenant,
        'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: '1-133-429-5778'
      })
    })
      .then(res => console.log(res));
  }
}

export default ForgotUserNameCtrl;
