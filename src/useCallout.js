import { useContext } from 'react';

import CalloutContext from './CalloutContext';

const useCallout = () => {
  return useContext(CalloutContext);
};

export default useCallout;
