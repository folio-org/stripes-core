import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { modules as uiModules } from 'stripes-config'; // eslint-disable-line

/* eslint-disable import/extensions */
import stripesCore from '@folio/stripes-core/package.json'; // eslint-disable-line
import stripesConnect from '@folio/stripes-connect/package.json';
import stripesComponents from '@folio/stripes-components/package.json';
import stripesLogger from '@folio/stripes-logger/package.json';
/* eslint-enable */

import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import { isVersionCompatible } from '../discoverServices';
import AboutEnabledModules from './AboutEnabledModules';

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

    return (<span>
      {m.module} {m.version} depends on:
      <ul>
        {
          Object.keys(okapiInterfaces).map((key) => {
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
          })
        }
      </ul>
    </span>);
  }

  function listModules(caption, list, interfaces) {
    const n = list.length;
    return (
      <div key={caption}>
        <h4>{n} {caption} module{n === 1 ? '' : 's'}</h4>
        <ul>
          {list.map(m => <li key={m.module}>{renderDependencies(m, interfaces)}</li>)}
        </ul>
      </div>
    );
  }

  const modules = _.get(props.stripes, ['discovery', 'modules']) || {};
  const interfaces = _.get(props.stripes, ['discovery', 'interfaces']) || {};
  const nm = Object.keys(modules).length;
  const ni = Object.keys(interfaces).length;
  const ConnectedAboutEnabledModules = props.stripes.connect(AboutEnabledModules);

  return (
    <Paneset>
      <Pane defaultWidth="30%" paneTitle="User interface">
        <h4>Foundation</h4>
        <span
          id="platform-versions"
          data-stripes-core={stripesCore.version}
          data-stripes-connect={stripesConnect.version}
          data-stripes-components={stripesComponents.version}
          data-okapi-version={_.get(props.stripes, ['discovery', 'okapi']) || 'unknown'}
          data-okapi-url={_.get(props.stripes, ['okapi', 'url']) || 'unknown'}
        />
        <ul>
          <li key="stripes-core">stripes-core {stripesCore.version}</li>
          <li key="stripes-connect">stripes-connect {stripesConnect.version}</li>
          <li key="stripes-components">stripes-components {stripesComponents.version}</li>
          <li key="stripes-logger">stripes-logger {stripesLogger.version}</li>
        </ul>
        {Object.keys(uiModules).map(key => listModules(key, uiModules[key]))}
      </Pane>
      <Pane defaultWidth="30%" paneTitle="Okapi services">
        <h4>Okapi</h4>
        <ul>
          <li>Version {_.get(props.stripes, ['discovery', 'okapi']) || 'unknown'}</li>
          <li>For tenant {_.get(props.stripes, ['okapi', 'tenant']) || 'unknown'}</li>
          <li>On URL {_.get(props.stripes, ['okapi', 'url']) || 'unknown'}</li>
        </ul>
        <h4>{nm} module{nm === 1 ? '' : 's'}</h4>
        <ConnectedAboutEnabledModules tenantid={_.get(props.stripes, ['okapi', 'tenant']) || 'unknown'} availableModules={modules} />
        <p>
          <b>Key.</b>
          <br />
          Installed modules that are not enabled for this tenant are
          displayed <span style={{ color: '#ccc' }}>in gray</span>.
        </p>

        <h4>{ni} interface{ni === 1 ? '' : 's'}</h4>
        <ul>
          {Object.keys(interfaces).sort().map(key => <li key={key}>{key} {interfaces[key]}</li>)}
        </ul>
      </Pane>
      <Pane defaultWidth="40%" paneTitle="UI/service dependencies">
        <h4>Foundation</h4>
        <ul>
          <li>
            {renderDependencies(Object.assign({}, stripesCore.stripes || {}, { module: 'stripes-core' }), interfaces)}
          </li>
        </ul>
        {Object.keys(uiModules).map(key => listModules(key, uiModules[key], interfaces))}
        <p>
          <b>Key.</b>
          <br />
          Interfaces that are required but absent are highlighted
          in <span style={{ color: 'red', fontWeight: 'bold' }}>bold red</span>.
          <br />
          Interfaces that are required but present only in an incompatible version are highlighted
          in <span style={{ color: 'orange' }}>orange</span>.
          <br />
          Interfaces that are present in a compatible version are shown in regular font.
        </p>
      </Pane>
    </Paneset>
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
