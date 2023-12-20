import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  List,
} from '@folio/stripes-components';

/**
 * AboutUIModuleDetails
 * Given a UI module, display its name, version; optionally show the interfaces
 * it module depends on.
 *
 * @param {object} module
 * @param {array} showDependencies
 * @returns
 */
const AboutUIModuleDetails = ({ module, showDependencies }) => {
  const base = `${module.module} ${module.version}`;

  if (!showDependencies) {
    return base;
  }

  if (!module.okapiInterfaces) {
    return <FormattedMessage id="stripes-core.about.noDependencies" values={{ base }} />;
  }

  const items = Object.keys(module.okapiInterfaces).sort().map(
    (item) => `${item} ${module.okapiInterfaces[item]}`
  );

  return (
    <>
      <FormattedMessage id="stripes-core.about.moduleDependsOn" values={{ module: `${module.module} ${module.version || ''}` }} />
      <List
        items={items}
        listStyle="bullets"
      />
    </>
  );
};

AboutUIModuleDetails.propTypes = {
  module: PropTypes.object,
  showDependencies: PropTypes.bool,
};

export default AboutUIModuleDetails;
