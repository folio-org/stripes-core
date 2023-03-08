import React, { useContext } from 'react';

export const CalloutContext = React.createContext();

export const useCallout = () => {
  return useContext(CalloutContext);
};
