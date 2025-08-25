import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Headline,
} from '@folio/stripes-components';

import css from './About.css';
import AboutModules from './AboutModules';

/**
 * AboutApplicationVersions
 * Applications listed by discovery
 * @param {*} param0
 * @returns
 */
const AboutApplicationVersions = ({ message, applications }) => {
  return (
    <div className={css.versionsColumn} data-test-stripes-core-about-module-versions>
      <Headline size="large">
        <FormattedMessage id="stripes-core.about.applicationsVersionsTitle" />
      </Headline>
      <Headline>{message}</Headline>
      {Object.values(applications)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((app) => {
          return (
            <ul key={app.name}>
              <li>
                <Headline>{app.name}</Headline>
                <AboutModules list={app.modules} />
              </li>
            </ul>
          );
        })}
    </div>
  );
};

AboutApplicationVersions.propTypes = {
  applications: PropTypes.object,
  message: PropTypes.object,
};

export default AboutApplicationVersions;
