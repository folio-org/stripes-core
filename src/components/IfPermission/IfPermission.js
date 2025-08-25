import PropTypes from 'prop-types';
import { useStripes } from '../../StripesContext';

const IfPermission = ({ children, perm }) => {
  const stripes = useStripes();
  const hasPermission = stripes.hasPerm(perm);

  if (typeof children === 'function') {
    return children({ hasPermission });
  }

  return hasPermission ? children : null;
};

IfPermission.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  perm: PropTypes.string.isRequired
};

export default IfPermission;
