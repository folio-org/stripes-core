import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { modules as uiModules } from 'stripes-config'; // eslint-disable-line
import { FormattedMessage } from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
/* eslint-disable import/extensions */
import stripesConnect from '@folio/stripes-connect/package.json';
import stripesComponents from '@folio/stripes-components/package.json';
import stripesLogger from '@folio/stripes-logger/package.json';
/* eslint-enable */

import Pane from '@folio/stripes-components/lib/Pane';
import Headline from '@folio/stripes-components/lib/Headline';
import List from '@folio/stripes-components/lib/List';
import { isVersionCompatible } from '../../discoverServices';
import AboutEnabledModules from './AboutEnabledModules';

import stripesCore from '../../../package.json'; // eslint-disable-line
import css from './About.css';

const About = (props) => {
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
      const required = okapiInterfaces[key];
      const available = interfaces[key];
      let style = {};
      let text = required;

      if (!available) {
        style = { color: 'red', fontWeight: 'bold' };
      } else if (!isVersionCompatible(available, required)) {
        style = { color: 'orange' };
        text = <FormattedMessage id="stripes-core.about.newerModuleAvailable" values={{ required, available }} />;
      }

      return <li key={key} style={style}>{key} {text}</li>;
    };

    return (
      <span>
        <Headline size="small" faded>
          <FormattedMessage id="stripes-core.about.moduleDependsOn" values={{ module: `${m.module} ${m.version || ''}` }} />
        </Headline>
        <List
          items={Object.keys(okapiInterfaces)}
          itemFormatter={itemFormatter}
          listStyle="bullets"
        />
      </span>
    );
  }

  function listModules(caption, list, interfaces) {
    const itemFormatter = m => (<li key={m.module}>{renderDependencies(m, interfaces)}</li>);
    const headlineMsg = list.length === 1 ? <FormattedMessage id="stripes-core.about.oneSpecialModule" values={{ type: caption }} /> : <FormattedMessage id="stripes-core.about.numOfSpecialModules" values={{ num: list.length, type: caption }} />;
    return (
      <div key={caption}>
        <Headline>{headlineMsg}</Headline>
        <List
          listStyle="bullets"
          items={list}
          itemFormatter={itemFormatter}
        />
        <br />
      </div>
    );
  }

  const modules = _.get(props.stripes, ['discovery', 'modules']) || {};
  const interfaces = _.get(props.stripes, ['discovery', 'interfaces']) || {};
  const nm = Object.keys(modules).length;
  const ni = Object.keys(interfaces).length;
  const ConnectedAboutEnabledModules = props.stripes.connect(AboutEnabledModules);
  const formatMsg = props.stripes.intl.formatMessage;
  const unknownMsg = formatMsg({ id: 'stripes-core.about.unknown' });
  const numModulesMsg = nm === 1 ? formatMsg({ id: 'stripes-core.about.oneModule' }) : formatMsg({ id: 'stripes-core.about.numberOfModules' }, { num: nm });
  const numInterfacesMsg = ni === 1 ? formatMsg({ id: 'stripes-core.about.oneInterface' }) : formatMsg({ id: 'stripes-core.about.numberOfInterfaces' }, { num: ni });
  return (
    <Pane
      defaultWidth="fill"
      paneTitle={formatMsg({ id: 'stripes-core.about.paneTitle' })}
    >
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
          {Object.keys(uiModules).map(key => listModules(key, uiModules[key]))}
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
              formatMsg({ id: 'stripes-core.about.version' }, { version: _.get(props.stripes, ['discovery', 'okapi']) || unknownMsg }),
              formatMsg({ id: 'stripes-core.about.forTenant' }, { tenant: _.get(props.stripes, ['okapi', 'tenant']) || unknownMsg }),
              formatMsg({ id: 'stripes-core.about.onUrl' }, { url: _.get(props.stripes, ['okapi', 'url']) || unknownMsg }),
            ]}
          />
          <br />
          <Headline>{numModulesMsg}</Headline>
          <ConnectedAboutEnabledModules tenantid={_.get(props.stripes, ['okapi', 'tenant']) || unknownMsg} availableModules={modules} />
          <Headline size="small">
            <FormattedMessage id="stripes-core.about.legendKey" />
          </Headline>
          <SafeHTMLMessage
            id="stripes-core.about.notEnabledModules"
            values={{ className: css.isEmptyMessage }}
            tagName="p"
          />
          <br />
          <Headline>{numInterfacesMsg}</Headline>
          <List
            listStyle="bullets"
            items={Object.keys(interfaces).sort()}
            itemFormatter={key => (<li key={key}>{key} {interfaces[key]}</li>)}
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
          {Object.keys(uiModules).map(key => listModules(key, uiModules[key], interfaces))}
          <Headline size="small">
            <FormattedMessage id="stripes-core.about.legendKey" />
          </Headline>
          <p>
            <SafeHTMLMessage
              id="stripes-core.about.key.absentInterfaces"
              values={{ className: css.absent }}
            />
            <br />
            <SafeHTMLMessage
              id="stripes-core.about.key.incompatibleIntf"
              values={{ className: css.incompatible }}
            />
            <br />
            <FormattedMessage id="stripes-core.about.key.compatible" />
          </p>
        </div>
      </div>
    </Pane>
  );
};

About.propTypes = {
  stripes: PropTypes.shape({
    discovery: PropTypes.shape({
      modules: PropTypes.object,
      interfaces: PropTypes.object,
    }),
    intl: PropTypes.shape({
      formatMessage: PropTypes.func,
    }),
    connect: PropTypes.func,
  }).isRequired,
};

export default About;
