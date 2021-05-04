import PropTypes from 'prop-types';

import CurrentModuleContext from './CurrentModuleContext';
import useCurrentModule from './useCurrentModule';

const CurrentModuleProvider = ({ children, module }) => {
  let currentModule = useCurrentModule();

  if (currentModule) {
    const { module: moduleName } = module;
    const { moduleNesting } = currentModule;

    currentModule.moduleNesting = {
      ...moduleNesting,
      [moduleName]: module,
    };
  } else {
    currentModule = module;
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
