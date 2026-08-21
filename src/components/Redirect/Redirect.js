import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Redirect to the given URL. react-router's built-in Redirect is
 * insufficient because it only redirects to a path within the current
 * domain.
 *
 * @param {string} to: URL to redirect to, e.g. http://example.com/path/
 * @param {boolean} push: true to push onto history; false [default] to replace the current entry
 * @returns null
 */
const Redirect = ({ to, push }) => {
  useEffect(() => {
    const action = push ? 'assign' : 'replace';
    window.location[action](to);
  }, [to, push]);

  return null;
};

Redirect.propTypes = {
  to: PropTypes.string.isRequired,
  push: PropTypes.bool,
};

export default Redirect;
