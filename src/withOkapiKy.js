import React from 'react';
import { withStripes } from './StripesContext';
import useOkapiKy from './useOkapiKy';

const withOkapiKy = (WrappedComponent) => {
  const HOC = (props) => {
    const ky = useOkapiKy();
    return <WrappedComponent {...props} okapiKy={ky} />;
  };

  return withStripes(HOC);
};

export default withOkapiKy;
