import _ from 'lodash';
import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import stripesConnect from '@folio/stripes-connect/package';
import stripesComponents from '@folio/stripes-components/package';
import stripesLogger from '@folio/stripes-logger/package';

import {
  Pane,
  Headline,
  List,
  Loading
} from '@folio/stripes-components';
import AboutEnabledModules from './AboutEnabledModules';
import AboutInstallMessages from './AboutInstallMessages';
import WarningBanner from './WarningBanner';
import { withModules } from '../Modules';
import stripesCore from '../../../package';
import css from './About.css';

const About = (props) => {
  const titleRef = useRef(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    if (bannerRef.current) {
      bannerRef.current.focus();
    } else {
      titleRef.current?.focus();
    }
  }, []);

  function renderDependencies(m, interfaces) {
    const base = `${m.module} ${m.version}`;
    if (!interfaces) {
      return base;
    }

    const okapiInterfaces = m.okapiInterfaces;
    if (!okapiInterfaces) {
      return <FormattedMessage id="stripes-core.about.noDependencies" values={{ base }} />;
    }

    const itemFormatter = (key) => {
      const text = okapiInterfaces[key];

      return (
        <li key={key}>
          {key}
          {' '}
          {text}
        </li>
      );
    };

    return (
      <span>
        <Headline size="small" faded>
          <FormattedMessage id="stripes-core.about.moduleDependsOn" values={{ module: `${m.module} ${m.version || ''}` }} />
        </Headline>
        <List
          items={Object.keys(okapiInterfaces).sort()}
          itemFormatter={itemFormatter}
          listStyle="bullets"
        />
      </span>
    );
  }

  function listModules(caption, list, interfaces) {
    const itemFormatter = m => (<li key={m.module}>{renderDependencies(m, interfaces)}</li>);
    let headlineMsg;
    switch (caption) {
      case 'app':
        headlineMsg = <FormattedMessage id="stripes-core.about.appModuleCount" values={{ count: list.length }} />;
        break;
      case 'settings':
        headlineMsg = <FormattedMessage id="stripes-core.about.settingsModuleCount" values={{ count: list.length }} />;
        break;
      case 'plugin':
        headlineMsg = <FormattedMessage id="stripes-core.about.pluginModuleCount" values={{ count: list.length }} />;
        break;
      default:
        headlineMsg = <FormattedMessage id="stripes-core.about.moduleTypeCount" values={{ count: list.length, type: caption }} />;
    }

    list.sort();

    return (
      <div key={caption}>
        <Headline>{headlineMsg}</Headline>
        <div data-test-stripes-core-about-module={caption}>
          <List
            listStyle="bullets"
            items={list}
            itemFormatter={itemFormatter}
          />
        </div>
      </div>
    );
  }

  const modules = _.get(props.stripes, ['discovery', 'modules']) || {};
  const interfaces = _.get(props.stripes, ['discovery', 'interfaces']) || {};
  const isLoadingFinished = _.get(props.stripes, ['discovery', 'isFinished']);
  const nm = Object.keys(modules).length;
  const ni = Object.keys(interfaces).length;
  const ConnectedAboutEnabledModules = props.stripes.connect(AboutEnabledModules);
  const unknownMsg = <FormattedMessage id="stripes-core.about.unknown" />;
  const numModulesMsg = <FormattedMessage id="stripes-core.about.moduleCount" values={{ count: nm }} />;
  const numInterfacesMsg = <FormattedMessage id="stripes-core.about.interfaceCount" values={{ count: ni }} />;

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
      <AboutInstallMessages stripes={props.stripes} />
      <div className={css.versionsContainer}>
        <div className={css.versionsColumn}>
          <Headline size="large">
            <FormattedMessage id="stripes-core.about.userInterface" />
          </Headline>
          <Headline>
            <FormattedMessage id="stripes-core.about.foundation" />
          </Headline>
          <span
            id="platform-versions"
            data-stripes-core={stripesCore.version}
            data-stripes-connect={stripesConnect.version}
            data-stripes-components={stripesComponents.version}
            data-okapi-version={_.get(props.stripes, ['discovery', 'okapi']) || unknownMsg}
            data-okapi-url={_.get(props.stripes, ['okapi', 'url']) || unknownMsg}
          />
          <List
            listStyle="bullets"
            items={[
              {
                key: 'stripes-core',
                value: `stripes-core ${stripesCore.version}`,
              },
              {
                key: 'stripes-connect',
                value: `stripes-connect ${stripesConnect.version}`,
              },
              {
                key: 'stripes-components',
                value: `stripes-components ${stripesComponents.version}`,
              },
              {
                key: 'stripes-logger',
                value: `stripes-logger ${stripesLogger.version}`,
              },
            ]}
            itemFormatter={item => (<li key={item.key}>{item.value}</li>)}
          />
          <br />
          <div data-test-stripes-core-about-module-versions>
            {Object.keys(props.modules).map(key => listModules(key, props.modules[key]))}
          </div>
        </div>
        <div className={css.versionsColumn}>
          <Headline size="large">
            <FormattedMessage id="stripes-core.about.okapiServices" />
          </Headline>
          <Headline>Okapi</Headline>
          <List
            listStyle="bullets"
            itemFormatter={(item, i) => (<li key={i}>{item}</li>)}
            items={[
              <FormattedMessage id="stripes-core.about.version" values={{ version: _.get(props.stripes, ['discovery', 'okapi']) || unknownMsg }} />,
              <FormattedMessage id="stripes-core.about.forTenant" values={{ tenant: _.get(props.stripes, ['okapi', 'tenant']) || unknownMsg }} />,
              <FormattedMessage id="stripes-core.about.onUrl" values={{ url: _.get(props.stripes, ['okapi', 'url']) || unknownMsg }} />
            ]}
          />
          <br />
          <Headline>{numModulesMsg}</Headline>
          <ConnectedAboutEnabledModules tenantid={_.get(props.stripes, ['okapi', 'tenant']) || unknownMsg} availableModules={modules} />
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
            items={Object.keys(interfaces).sort()}
            itemFormatter={key => (
              <li key={key}>
                {`${key} ${interfaces[key]}`}
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
          {renderDependencies(Object.assign({}, stripesCore.stripes || {}, { module: 'stripes-core' }), interfaces)}
          <br />
          {Object.keys(props.modules).map(key => listModules(key, props.modules[key], interfaces))}
        </div>
      </div>
    </Pane>
  );
};

About.propTypes = {
  modules: PropTypes.object,
  stripes: PropTypes.shape({
    discovery: PropTypes.shape({
      modules: PropTypes.object,
      interfaces: PropTypes.object,
    }),
    connect: PropTypes.func,
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
};

export default withModules(About);
