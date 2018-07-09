import React from 'react';
import { modules } from 'stripes-config'; // eslint-disable-line


export default React.createContext(modules);
export { modules as originalModules };
