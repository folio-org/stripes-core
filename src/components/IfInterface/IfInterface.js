import PropTypes from 'prop-types';
import { useStripes } from '../../StripesContext';

const IfInterface = ({ children, name, version }) => {
  const stripes = useStripes();
  const hasInterface = stripes.hasInterface(name, version);

  if (typeof children === 'function') {
    return children({ hasInterface });
  }

  return hasInterface ? children : null;
};

IfInterface.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string.isRequired,
  version: PropTypes.string,
};

export default IfInterface;
