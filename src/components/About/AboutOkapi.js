import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Headline, List } from '@folio/stripes-components';

import AboutAPIGateway from './AboutAPIGateway';
import AboutStripes from './AboutStripes';
import AboutUIModuleDetails from './AboutUIModuleDetails';
import AboutUIDependencies from './AboutUIDependencies';

import { withModules } from '../Modules';
import css from './About.css';
import stripesCore from '../../../package';
import { useStripes } from '../../StripesContext';
import AboutEnabledModules from './AboutEnabledModules';

const AboutOkapi = ({ modules }) => {
  const stripes = useStripes();

  const dmodules = stripes.discovery.modules || {};
  const dinterfaces = stripes.discovery.interfaces || {};

  const nm = Object.keys(dmodules).length;
  const ni = Object.keys(dinterfaces).length;

  const unknownMsg = <FormattedMessage id="stripes-core.about.unknown" />;
  const numModulesMsg = <FormattedMessage id="stripes-core.about.moduleCount" values={{ count: nm }} />;
  const numInterfacesMsg = <FormattedMessage id="stripes-core.about.interfaceCount" values={{ count: ni }} />;


  return (
    <>
      <div className={css.versionsColumn} data-test-stripes-core-about-module-versions>
        <AboutStripes />
        <AboutUIDependencies modules={modules} />
      </div>

      <div className={css.versionsColumn}>
        <AboutAPIGateway />

        <Headline>{numModulesMsg}</Headline>
        <AboutEnabledModules tenantid={stripes.okapi.tenant || unknownMsg} availableModules={dmodules} />
        <Headline size="small">
          <FormattedMessage id="stripes-core.about.legendKey" />
        </Headline>
        <FormattedMessage
          id="stripes-core.about.notEnabledModules"
          tagName="p"
          values={{
            span: chunks => <span className={css.isEmptyMessage}>{chunks}</span>
          }}
        />
        <br />
        <Headline>{numInterfacesMsg}</Headline>
        <List
          listStyle="bullets"
          items={Object.keys(dinterfaces).sort((a, b) => a.localeCompare(b))}
          itemFormatter={key => (
            <li key={key}>
              {`${key} ${dinterfaces[key]}`}
            </li>
          )}
        />
      </div>

      <div className={css.versionsColumn}>
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
        <AboutUIDependencies modules={modules} showDependencies />
      </div>
    </>
  );
};

AboutOkapi.propTypes = {
  modules: PropTypes.shape({
    app: PropTypes.arrayOf(PropTypes.object),
    plugin: PropTypes.arrayOf(PropTypes.object),
    settings: PropTypes.arrayOf(PropTypes.object),
    handler: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default withModules(AboutOkapi);
