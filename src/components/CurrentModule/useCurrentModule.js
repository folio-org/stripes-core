import { useContext } from 'react';

import CurrentModuleContext from './CurrentModuleContext';

const useCurrentModule = () => useContext(CurrentModuleContext);

export default useCurrentModule;
