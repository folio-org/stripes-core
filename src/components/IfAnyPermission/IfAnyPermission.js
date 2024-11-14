import PropTypes from 'prop-types';
import { useStripes } from '../../StripesContext';

const IfAnyPermission = ({ children, perm }) => {
  const stripes = useStripes();
  const hasPermission = stripes.hasAnyPerm(perm);

  if (typeof children === 'function') {
    return children({ hasPermission });
  }

  return hasPermission ? children : null;
};

IfAnyPermission.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  perm: PropTypes.string.isRequired
};

export default IfAnyPermission;
