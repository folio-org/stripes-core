import React, { useContext } from 'react';

import { CalloutContext } from '@folio/stripes-shared-context';

export { CalloutContext };

export const useCallout = () => {
  return useContext(CalloutContext);
};
