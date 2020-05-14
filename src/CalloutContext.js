import React from 'react';

export const ToastContext = React.createContext();

// deprecated, might be `null` after page refresh or at first render
const CalloutContext = React.createContext();
export default CalloutContext;
