import PropTypes from 'prop-types';

import CurrentModuleContext from './CurrentModuleContext';
import useCurrentModule from './useCurrentModule';

const CurrentModuleProvider = ({ children, module }) => {
  let currentModule = useCurrentModule();

  if (!currentModule) {
    currentModule = module;
  } else {
    const { moduleNesting = new Set() } = currentModule;

    if (!moduleNesting.has(module)) {
      moduleNesting.add(module);
    }

    currentModule.moduleNesting = moduleNesting;
  }

  return (
    <CurrentModuleContext.Provider value={{ ...currentModule }}>
      {children}
    </CurrentModuleContext.Provider>
  );
};

CurrentModuleProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  module: PropTypes.object.isRequired,
};

export default CurrentModuleProvider;
