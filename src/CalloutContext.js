import React, { useContext, useEffect, useState } from 'react';

export const CalloutContext = React.createContext();

export const CalloutProvider = ({ children, value }) => {
  const [calloutQueue, setCalloutQueue] = useState([]);

  useEffect(
    () => {
      if (value?.sendCallout) {
        calloutQueue.forEach(c => value.sendCallout(c));
      }
    },
    [value, calloutQueue]
  );

  const defaultContext = {
    sendCallout: (args) => setCalloutQueue(cur => [...cur, args])
  };

  return (
    <CalloutContext.Provider value={value || defaultContext}>
      {children}
    </CalloutContext.Provider>
  );
};

export const useCallout = () => {
  return useContext(CalloutContext);
};
