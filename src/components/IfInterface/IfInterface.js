import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useStripes } from '../../StripesContext';

const IfInterface = ({ children, name, version }) => {
  const stripes = useStripes();
  const [hasInterface, setHasInterface] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkInterface = async () => {
      setLoading(true);
      try {
        const result = stripes.hasInterface(name, version);
        
        // If result is a Promise, wait for it
        if (result && typeof result.then === 'function') {
          const resolved = await result;
          setHasInterface(resolved);
        } else {
          // If result is synchronous, use it directly
          setHasInterface(result);
        }
      } catch (error) {
        console.error('Error checking interface:', error);
        setHasInterface(undefined);
      } finally {
        setLoading(false);
      }
    };

    checkInterface();
  }, [stripes, name, version]);

  // If still loading and we got a Promise, don't render anything yet
  if (loading) {
    return null;
  }

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
