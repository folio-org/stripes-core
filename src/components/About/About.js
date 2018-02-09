import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { modules as uiModules } from 'stripes-config'; // eslint-disable-line

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
      return `${base} declares no dependencies`;
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
        text = `${required} (${available} available)`;
      }

      return <li key={key} style={style}>{key} {text}</li>;
    };

    return (
      <span>
        <Headline size="small" faded>{m.module} {m.version} depends on:</Headline>
        <List
          items={Object.keys(okapiInterfaces)}
          itemFormatter={itemFormatter}
          listStyle="bullets"
        />
      </span>
    );
  }

  function listModules(caption, list, interfaces) {
    const n = list.length;
    const itemFormatter = m => (<li key={m.module}>{renderDependencies(m, interfaces)}</li>);
    return (
      <div key={caption}>
        <Headline>{n} {caption} module{n === 1 ? '' : 's'}</Headline>
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

  return (
    <Pane
      defaultWidth="fill"
      paneTitle="Software versions"

    >
      <div className={css.versionsContainer}>
        <div className={css.versionsColumn}>
          <Headline size="large">User interface</Headline>
          <Headline>Foundation</Headline>
          <span
            id="platform-versions"
            data-stripes-core={stripesCore.version}
            data-stripes-connect={stripesConnect.version}
            data-stripes-components={stripesComponents.version}
            data-okapi-version={_.get(props.stripes, ['discovery', 'okapi']) || 'unknown'}
            data-okapi-url={_.get(props.stripes, ['okapi', 'url']) || 'unknown'}
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
          <Headline size="large">Okapi services</Headline>
          <Headline>Okapi</Headline>
          <List
            listStyle="bullets"
            itemFormatter={(item, i) => (<li key={i}>{item}</li>)}
            items={[
              `Version ${_.get(props.stripes, ['discovery', 'okapi']) || 'unknown'}`,
              `For tenant ${_.get(props.stripes, ['okapi', 'tenant']) || 'unknown'}`,
              `On URL ${_.get(props.stripes, ['okapi', 'url']) || 'unknown'}`,
            ]}
          />
          <br />
          <Headline>{nm} module{nm === 1 ? '' : 's'}</Headline>
          <ConnectedAboutEnabledModules tenantid={_.get(props.stripes, ['okapi', 'tenant']) || 'unknown'} availableModules={modules} />
          <Headline size="small">Key</Headline>
          <p>
            Installed modules that are not enabled for this tenant are
            displayed <span style={{ color: '#ccc' }}>in gray</span>.
          </p>
          <br />
          <Headline>{ni} interface{ni === 1 ? '' : 's'}</Headline>
          <List
            listStyle="bullets"
            items={Object.keys(interfaces).sort()}
            itemFormatter={key => (<li key={key}>{key} {interfaces[key]}</li>)}
          />
        </div>
        <div className={css.versionsColumn}>
          <Headline size="large">UI/service dependencies</Headline>
          <Headline>Foundation</Headline>
          {renderDependencies(Object.assign({}, stripesCore.stripes || {}, { module: 'stripes-core' }), interfaces)}
          <br />
          {Object.keys(uiModules).map(key => listModules(key, uiModules[key], interfaces))}
          <Headline size="small">Key</Headline>
          <p>
            Interfaces that are required but absent are highlighted
            in <span style={{ color: 'red', fontWeight: 'bold' }}>bold red</span>.
            <br />
            Interfaces that are required but present only in an incompatible version are highlighted
            in <span style={{ color: 'orange' }}>orange</span>.
            <br />
            Interfaces that are present in a compatible version are shown in regular font.
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
    connect: PropTypes.func,
  }).isRequired,
};

export default About;
