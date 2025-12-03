import { useContext, createContext } from 'react';

export const CalloutContext = createContext();

export const useCallout = () => {
  return useContext(CalloutContext);
};
