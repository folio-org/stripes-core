import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { reduxForm, Field } from 'redux-form';
import TextField from '@folio/stripes-components/lib/TextField';
import Headline from '@folio/stripes-components/lib/Headline';
import Button from '@folio/stripes-components/lib/Button';
import css from './Login.css';
import authFormStyles from './AuthForm.css';
import SSOLogin from '../SSOLogin';

class Login extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    authError: PropTypes.string,
    handleSSOLogin: PropTypes.func,
    ssoActive: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  }

  componentDidMount() {
    // Focus username input on mount
    document.getElementById('input-username').focus();
    console.warn('Mounted!');
  }

  render() {
    const {
      handleSubmit,
      pristine,
      submitting,
      authError,
      handleSSOLogin,
      ssoActive,
    } = this.props;
console.log('properions', this.props);
    return (
      <div className={authFormStyles.wrap}>
        <div className={authFormStyles.centered}>
          <header className={authFormStyles.header}>
            <div className={authFormStyles.logo}>
              <img alt="" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAwEAAAHqCAIAAADTYdUqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0ZCMUZGNzlFMERFMTFFNzkyNDFGRUQ2OTBEOEI3MDUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0ZCMUZGN0FFMERFMTFFNzkyNDFGRUQ2OTBEOEI3MDUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDRkIxRkY3N0UwREUxMUU3OTI0MUZFRDY5MEQ4QjcwNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDRkIxRkY3OEUwREUxMUU3OTI0MUZFRDY5MEQ4QjcwNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhOJQH4AABZSSURBVHja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" />
            </div>
          </header>
          <form className={authFormStyles.form}>
            <Headline className={authFormStyles.formTitle} tag="h1" size="large">Log in</Headline>
            <div className={authFormStyles.formGroup}>
              <Field id="input-username" component={TextField} name="username" type="text" placeholder="Username" marginBottom0 fullWidth inputClass={authFormStyles.input} required />
            </div>
            <div className={authFormStyles.formGroup}>
              <Field id="input-password" component={TextField} name="password" type="password" placeholder="Password" marginBottom0 fullWidth inputClass={authFormStyles.input} required />
            </div>
            <div className={authFormStyles.formGroup}>
              <Button id="clickable-login" buttonClass={authFormStyles.submitButton} onClick={handleSubmit} disabled={submitting || pristine} fullWidth>
                {submitting ? 'Please wait..' : 'Log in'}
              </Button>
            </div>
            <div className={authFormStyles.formGroup}>
              { authError ? <div className={classNames(authFormStyles.formMessage, authFormStyles.error)}>{authError}</div> : null }
            </div>
          </form>
          { ssoActive && <SSOLogin handleSSOLogin={handleSSOLogin} /> }
        </div>
      </div>
    );
  }
}

export default reduxForm(
  {
    form: 'login',
  },
)(Login);
