import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';

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

  useEffect(() => {
    getLocale(stripes.okapi.url, stripes.store, stripes.okapi.tenant)
      .then(logout(stripes.okapi.url, stripes.store, history))
      .then(setDidLogout(true));
  }, [history, stripes]);

  return (didLogout ? <Redirect to="/" /> : <h1>LOGGED OUT YO</h1>);
};

Logout.propTypes = {
  history: PropTypes.object,
};

export default Logout;
