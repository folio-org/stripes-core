import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Headline,
  List,
} from '@folio/stripes-components';

import AboutUIModuleDetails from './AboutUIModuleDetails';

/**
 * AboutUIDependencies
 * Display
 *
 * @param {object} modules { app[], settings[], plugin[], handler[] }
 *   array entries contain module details from discovery
 * @param {bool} showDependencies true to display interface dependencies
 * @returns
 */
const AboutUIDependencies = ({ modules, showDependencies }) => {
  const itemFormatter = (m) => (
    <li key={m.module}>
      <AboutUIModuleDetails module={m} showDependencies={showDependencies} />
    </li>
  );

  const headlineFor = (key, count) => {
    let headlineMsg;
    switch (key) {
      case 'app':
        headlineMsg = <FormattedMessage id="stripes-core.about.appModuleCount" values={{ count }} />;
        break;
      case 'settings':
        headlineMsg = <FormattedMessage id="stripes-core.about.settingsModuleCount" values={{ count }} />;
        break;
      case 'plugin':
        headlineMsg = <FormattedMessage id="stripes-core.about.pluginModuleCount" values={{ count }} />;
        break;
      default:
        headlineMsg = <FormattedMessage id="stripes-core.about.moduleTypeCount" values={{ count, type: key }} />;
    }
    return headlineMsg;
  };

  return Object.keys(modules).map((key) => {
    const items = modules[key].sort((a, b) => a.module.localeCompare(b.module));
    return (
      <div key={key}>
        <Headline>{headlineFor(key, items.length)}</Headline>
        <div data-test-stripes-core-about-module={key}>
          <List
            listStyle="bullets"
            items={items}
            itemFormatter={itemFormatter}
          />
        </div>
      </div>
    );
  });
};

AboutUIDependencies.propTypes = {
  modules: PropTypes.object,
  showDependencies: PropTypes.bool,
};

export default AboutUIDependencies;
