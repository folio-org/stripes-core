import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import CurrentModuleContext from './CurrentModuleContext';
import { useModules } from '../../ModulesContext';
import { packageName } from '../../constants';

const CurrentModuleProvider = ({ children }) => {
  const modules = useModules();
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(name => name);
  const path = (parts?.[0] === 'settings') ? parts[1] : parts[0];
  const currentModule = modules?.app?.find(({ module }) => (
    module.replace(packageName.PACKAGE_SCOPE_REGEX, '') === path
  ));

  return (
    <CurrentModuleContext.Provider value={currentModule}>
      {children}
    </CurrentModuleContext.Provider>
  );
};

CurrentModuleProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]),
};

export default CurrentModuleProvider;
