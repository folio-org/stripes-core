import _ from 'lodash';
import React, { PropTypes } from 'react';
import { modules as uiModules } from 'stripes-loader'; // eslint-disable-line

import stripesCore from '@folio/stripes-core/package.json'; // eslint-disable-line
import stripesLoader from '@folio/stripes-loader/package.json';
import stripesConnect from '@folio/stripes-connect/package.json';
import stripesComponents from '@folio/stripes-components/package.json';
import stripesLogger from '@folio/stripes-logger/package.json';

import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';

import { isVersionCompatible } from '../discoverServices';

const About = (props) => {
  function renderDependencies(m, interfaces) {
    const base = `${m.module} ${m.version}`;
    if (!interfaces)
      return base;
    const okapiInterfaces = m.okapiInterfaces;
    if (!okapiInterfaces)
      return `${base} has no dependencies`;

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

  return (
    <Paneset>
      <Pane defaultWidth="30%" paneTitle="User interface">
        <h4>Foundation</h4>
        <ul>
          <li key="stripes-core">stripes-core {stripesCore.version}</li>
          <li key="stripes-loader">stripes-loader {stripesLoader.version}</li>
          <li key="stripes-connect">stripes-connect {stripesConnect.version}</li>
          <li key="stripes-components">stripes-components {stripesComponents.version}</li>
          <li key="stripes-logger">stripes-logger {stripesLogger.version}</li>
        </ul>
        {Object.keys(uiModules).map(key => listModules(key, uiModules[key]))}
      </Pane>
      <Pane defaultWidth="30%" paneTitle="Okapi services">
        <h4>Okapi version</h4>
        <ul>
          <li>{_.get(props.stripes, ['discovery', 'okapi']) || 'unknown'}</li>
        </ul>
        <h4>{nm} module{nm === 1 ? '' : 's'}</h4>
        <ul>
          {Object.keys(modules).sort().map(key => <li key={key}>{modules[key]} (<tt>{key}</tt>)</li>)}
        </ul>

        <h4>{ni} interface{ni === 1 ? '' : 's'}</h4>
        <ul>
          {Object.keys(interfaces).sort().map(key => <li key={key}>{key} {interfaces[key]}</li>)}
        </ul>
      </Pane>
      <Pane defaultWidth="40%" paneTitle="UI/service dependencies">
        <h4>Foundation</h4>
        <ul>
          <li>
            {renderDependencies(Object.assign({}, stripesCore, { module: 'stripes-core' }), interfaces)}
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
  }).isRequired,
};

export default About;
