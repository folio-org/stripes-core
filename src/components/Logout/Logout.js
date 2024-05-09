import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { useStripes } from '../../StripesContext';
import { getLocale, logout } from '../../loginServices';

/**
 * Logout
 * Call logout, then redirect to root.
 *
 * This corresponds to the '/logout' route, allowing that route to be directly
 * accessible rather than only accessible through the menu action.
 *
 * @param {object} history
 */
const Logout = ({ history }) => {
  const stripes = useStripes();
  const [didLogout, setDidLogout] = useState(false);

  useEffect(
    () => {
      getLocale(stripes.okapi.url, stripes.store, stripes.okapi.tenant)
        .then(logout(stripes.okapi.url, stripes.store, history))
        .then(setDidLogout(true));
    },
    // no dependencies because we only want to start the logout process once.
    // we don't care about changes to history or stripes; certainly those
    // could be updated as part of the logout process
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return didLogout ? <Redirect to="/" /> : <FormattedMessage id="stripes-core.logoutPending" />;
};

Logout.propTypes = {
  history: PropTypes.object,
};

export default Logout;
