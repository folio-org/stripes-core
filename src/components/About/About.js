import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { okapi as okapiConfig } from 'stripes-config';
import {
  Headline,
  Loading,
  Pane,
} from '@folio/stripes-components';

import AboutInstallMessages from './AboutInstallMessages';
import WarningBanner from './WarningBanner';
import { withModules } from '../Modules';
import css from './About.css';
import { useStripes } from '../../StripesContext';
import AboutOkapi from './AboutOkapi';
import AboutApplicationVersions from './AboutApplicationVersions';
import AboutStripes from './AboutStripes';
import AboutAPIGateway from './AboutAPIGateway';
import AboutUIDependencies from './AboutUIDependencies';
import AboutUIModuleDetails from './AboutUIModuleDetails';
import stripesCore from '../../../package';

const About = (props) => {
  const titleRef = useRef(null);
  const bannerRef = useRef(null);
  const stripes = useStripes();

  useEffect(() => {
    if (bannerRef.current) {
      bannerRef.current.focus();
    } else {
      titleRef.current?.focus();
    }
  }, []);

  const applications = stripes.discovery?.applications || {};
  const interfaces = stripes.discovery?.interfaces || {};
  const isLoadingFinished = stripes.discovery?.isFinished;
  const na = Object.keys(applications).length;

  const numApplicationsMsg = (
    <FormattedMessage
      id="stripes-core.about.applicationCount"
      values={{ count: na }}
    />
  );

  return (
    <Pane
      defaultWidth="fill"
      paneTitle={<FormattedMessage id="stripes-core.about.paneTitle" />}
      paneTitleRef={titleRef}
    >
      {!isLoadingFinished ? (
        <Loading />
      ) : (
        <WarningBanner
          interfaces={interfaces}
          modules={props.modules}
          bannerRef={bannerRef}
        />
      )}
      <AboutInstallMessages />
      <div className={css.versionsContainer}>
        {okapiConfig.tenantOptions ? (
          <>
            <div className={css.versionsColumn} data-test-stripes-core-about-module-versions>
              <AboutApplicationVersions message={numApplicationsMsg} applications={applications} />
            </div>
            <div className={css.versionsColumn}>
              <AboutStripes />
              <br />
              <AboutAPIGateway />
              <br />
              <Headline size="large">
                <FormattedMessage id="stripes-core.about.uiOrServiceDependencies" />
              </Headline>
              <Headline>
                <FormattedMessage id="stripes-core.about.foundation" />
              </Headline>
              <AboutUIModuleDetails
                module={{
                  ...stripesCore.stripes,
                  module: 'stripes-core',
                  version: stripesCore.version
                }}
                showDependencies
              />
              <AboutUIDependencies modules={props.modules} showDependencies />
            </div>
          </>
        ) : (
          <AboutOkapi discovery={stripes.discovery} />
        )}
      </div>
    </Pane>
  );
};

About.propTypes = {
  modules: PropTypes.object,
};

export default withModules(About);
