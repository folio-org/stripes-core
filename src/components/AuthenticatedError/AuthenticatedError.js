import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Headline } from '@folio/stripes-components';

import Pluggable from '../../Pluggable';

import css from './AuthenticatedError.css';

/**
 * Show a full-screen error message for an authenticated user, e.g. for an
 * invalid route.
 *
 * @param {message} param0
 * @returns
 */
const AuthenticatedError = ({ location }) => {
  let message = <FormattedMessage
    id="stripes-core.front.error.general.message"
    values={{
      url: location.pathname,
      br: <br />,
    }}
  />;

  // reset-password _is_ a valid route, but not for an authenticated user.
  // if that's the route, show a special error message. otherwise, show
  // a generic "bad request" message.
  if (location.pathname.startsWith('/reset-password')) {
    message = <FormattedMessage id="stripes-core.front.error.setPassword.message" />;
  }

  return (
    <Pluggable type="frontpage">
      <div className={css.titleWrap}>
        <Headline
          faded
          tag="h1"
          margin="none"
          className={css.title}
        >
          <FormattedMessage id="stripes-core.front.error.header" />
        </Headline>
        <Headline
          faded
          tag="h3"
          margin="none"
          className={css.title}
        >
          {message}
        </Headline>
      </div>
    </Pluggable>
  );
};

AuthenticatedError.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  })
};

export default AuthenticatedError;
